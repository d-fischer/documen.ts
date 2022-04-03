import assert from 'assert';
import path from 'path';
import type { PackageJson } from 'type-fest';
import * as ts from 'typescript';
import type { Config } from '../../common/config/Config';
import type { ReferenceLocation, SerializedPackage, SerializedProject } from '../../common/reference';
import { parseConfig } from '../../common/tools/ConfigTools';
import { AnalyzeContext } from './AnalyzeContext';
import { createReflection } from './createReflection';
import type { Reflection } from './reflections/Reflection';
import type { SymbolBasedReflection } from './reflections/SymbolBasedReflection';
import type { ReferenceType } from './types/ReferenceType';
import { nodeToSymbol } from './util/symbols';

export class Project {
	private readonly _symbolsByPackage = new Map<string, Reflection[]>();
	private readonly _packageNameToDir = new Map<string, string>();

	private readonly _reflectionsById = new Map<number, Reflection>();
	private readonly _packageNamesByReflectionId = new Map<number, string>();
	private _nextReflectionId = 1;

	private readonly _symbolsByReflectionId = new Map<number, ts.Symbol>();
	private readonly _reflectionIdsBySymbol = new Map<ts.Symbol, number>();
	private readonly _brokenReferences = new Map<ts.Symbol, ReferenceType[]>();

	constructor(private readonly _config: Config) {
	}
	async analyzeSinglePackage(packageJson: PackageJson) {
		const parsedConfig = parseConfig(path.join(this._config.baseDir, 'tsconfig.json'));

		const scopeLength = this._config.packageScope ? this._config.packageScope.length + 2 : 0;
		const packageName = packageJson.name!.slice(scopeLength);

		await this._analyzePackage(packageName, this._config.baseDir, packageJson, parsedConfig);
	}

	async analyzeMonorepoPackage(packageDirName: string, packageJson: PackageJson) {
		assert(this._config.monorepoRoot);
		const packageFolder = path.join(this._config.baseDir, this._config.monorepoRoot, packageDirName);
		const parsedConfig = parseConfig(path.join(packageFolder, 'tsconfig.json'));

		const scopeLength = this._config.packageScope ? this._config.packageScope.length + 2 : 0;
		const packageName = packageJson.name!.slice(scopeLength);

		this._packageNameToDir.set(packageName, packageDirName);

		await this._analyzePackage(packageName, packageFolder, packageJson, parsedConfig);
	}

	serialize(): SerializedProject {
		const packages: SerializedPackage[] = [...this._symbolsByPackage.entries()].map(([packageName, packageSymbols]) => ({
			packageName,
			folderName: this._packageNameToDir.get(packageName),
			symbols: packageSymbols.map(sym => sym.serialize())
		}));

		return { packages };
	}

	registerReflection(reflection: Reflection): number {
		const id = this._nextReflectionId++;
		this._reflectionsById.set(id, reflection);
		return id;
	}

	registerSymbol(id: number, symbol: ts.Symbol, withReverse = true) {
		this._symbolsByReflectionId.set(id, symbol);
		if (withReverse) {
			this._reflectionIdsBySymbol.set(symbol, id);
		}
	}

	registerForPackageName(name: string, reflection: Reflection) {
		this._packageNamesByReflectionId.set(reflection.id, name);
	}

	findIdAtPosition(fullPath: string, line: number, column: number): number | undefined {
		for (const [id, rs] of this._reflectionsById) {
			const declarations = rs.declarations;
			for (const declaration of declarations) {
				const declSf = declaration.getSourceFile();
				if (declSf.fileName !== fullPath) {
					continue;
				}
				const pos = declSf.getPositionOfLineAndCharacter(line, column);

				if (pos === declaration.getStart()) {
					return id;
				}
			}
		}

		return undefined;
	}

	/**
	 * @param id
	 * @internal
	 */
	getPackageNameForReflectionId(id: number | undefined) {
		return id ? this._packageNamesByReflectionId.get(id) : undefined;
	}

	getSymbolForReflection(reflection: SymbolBasedReflection) {
		return this._symbolsByReflectionId.get(reflection.id);
	}

	getReflectionIdForSymbol(symbol: ts.Symbol) {
		return this._reflectionIdsBySymbol.get(symbol);
	}

	getReflectionForSymbol(symbol: ts.Symbol) {
		const reflectionId = this._reflectionIdsBySymbol.get(symbol);
		return reflectionId ? this._reflectionsById.get(reflectionId) : undefined;
	}

	registerBrokenReference(symbol: ts.Symbol, type: ReferenceType) {
		if (this._brokenReferences.has(symbol)) {
			this._brokenReferences.get(symbol)!.push(type);
		} else {
			this._brokenReferences.set(symbol, [type]);
		}
	}

	fixBrokenReferences() {
		for (const [symbol, types] of this._brokenReferences) {
			const reflectionIdForSymbol = this.getReflectionIdForSymbol(symbol);
			const packageForSymbol = this.getPackageNameForReflectionId(reflectionIdForSymbol);
			if (reflectionIdForSymbol !== undefined) {
				for (const type of types) {
					type.fixBrokenReference(reflectionIdForSymbol, packageForSymbol);
				}
			}
		}
	}

	getNodeLocation(node: ts.Node): ReferenceLocation;
	getNodeLocation(node?: ts.Node): ReferenceLocation | undefined;
	getNodeLocation(node?: ts.Node): ReferenceLocation | undefined {
		if (!node) {
			return undefined;
		}

		const sf = node.getSourceFile();
		const { fileName } = sf;
		const relativeFileName = path.relative(this._config.baseDir, fileName);
		const pos = node.getStart();
		const { character, line } = sf.getLineAndCharacterOfPosition(pos);

		return {
			fileName: relativeFileName,
			line: line + 1,
			character
		};
	}

	protected _getEntryPointForPackageFolder(dir: string, pkg: PackageJson, tsconfig: ts.ParsedCommandLine) {
		let mainJsFile: string = pkg.main!;
		const lastPathPart = mainJsFile.split(path.delimiter).reverse()[0];
		if (!/\.m?js]$/.test(lastPathPart)) {
			mainJsFile = path.join(mainJsFile, 'index.js');
		}

		const fullOutPath = path.join(dir, mainJsFile);
		const innerOutPath = path.relative(tsconfig.options.outDir!, fullOutPath);
		return path.join(tsconfig.options.rootDir!, innerOutPath.replace(/\.m?js$/, '.ts'));
	}

	private async _analyzePackage(packageName: string, packageFolder: string, packageJson: PackageJson, tsconfig: ts.ParsedCommandLine) {
		const { options, fileNames } = tsconfig;
		const prog = ts.createProgram({
			options,
			rootNames: fileNames
		});
		const checker = prog.getTypeChecker();
		const ctx = new AnalyzeContext(this, checker, packageName);

		const pathToEntryPoint = this._getEntryPointForPackageFolder(packageFolder, packageJson, tsconfig);
		const sf = prog.getSourceFile(pathToEntryPoint)!;
		const children = sf.statements;
		const fileExports = children
			.filter((child): child is ts.ExportDeclaration => ts.isExportDeclaration(child))
			.flatMap(expDecl => {
				const clause = expDecl.exportClause!;
				if (ts.isNamedExports(clause)) {
					return clause.elements;
				} else {
					throw new Error(`Namespace exports not supported yet (file: ${expDecl.getSourceFile().fileName})`);
				}
			})
			.map(exp => {
				const id = exp.name;
				return nodeToSymbol(ctx, id);
			});

		const result: Reflection[] = [];
		for (const sym of fileExports) {
			const reflection = await createReflection(ctx, sym);
			result.push(reflection);
		}

		this._symbolsByPackage.set(packageName, result);
	}
}
