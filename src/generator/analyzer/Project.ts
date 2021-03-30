import assert from 'assert';
import path from 'path';
import * as ts from 'typescript';
import type { PackageJson } from 'type-fest';
import type { SerializedPackage, SerializedProject } from '../../common/reference';
import { parseConfig } from '../../common/tools/ConfigTools';
import { AnalyzeContext } from './AnalyzeContext';
import { createReflection } from './createReflection';
import type { Reflection } from './reflections/Reflection';
import type { SymbolBasedReflection } from './reflections/SymbolBasedReflection';
import type { ReferenceType } from './types/ReferenceType';
import { nodeToSymbol } from './util/symbolUtil';

export class Project {
	private readonly _symbolsByPackage = new Map<string, Reflection[]>();
	private readonly _packageNameToDir = new Map<string, string>();

	private readonly _reflectionsById = new Map<number, Reflection>();
	private readonly _packageNamesByReflectionId = new Map<number, string>();
	private _nextReflectionId = 1;

	private readonly _symbolsByReflectionId = new Map<number, ts.Symbol>();
	private readonly _reflectionIdsBySymbol = new Map<ts.Symbol, number>();
	private readonly _brokenReferences = new Map<ts.Symbol, ReferenceType[]>();

	constructor(public readonly baseDir: string, public readonly monorepoRoot?: string) {
	}

	async analyzeSinglePackage(packageJson: PackageJson) {
		const parsedConfig = parseConfig(path.join(this.baseDir, 'tsconfig.json'));

		await this._analyzePackage(this.baseDir, packageJson, parsedConfig);
	}

	async analyzeMonorepoPackage(packageDirName: string, packageJson: PackageJson) {
		assert(this.monorepoRoot);
		const packageFolder = path.join(this.baseDir, this.monorepoRoot, packageDirName);
		const parsedConfig = parseConfig(path.join(packageFolder, 'tsconfig.json'));

		this._packageNameToDir.set(packageJson.name!, packageDirName);

		await this._analyzePackage(packageFolder, packageJson, parsedConfig);
	}

	serialize(): SerializedProject {
		const packages: SerializedPackage[] = [...this._symbolsByPackage.entries()].map(([packageName, packageSymbols]) => ({
			packageName,
			folderName: this._packageNameToDir.get(packageName),
			symbols: packageSymbols.map(sym => sym.serialize())
		}));

		return { packages };
	}

	/** @internal */
	registerReflection(reflection: Reflection): number {
		const id = this._nextReflectionId++;
		this._reflectionsById.set(id, reflection);
		return id;
	}

	/** @internal */
	registerSymbol(id: number, symbol: ts.Symbol, withReverse = true) {
		this._symbolsByReflectionId.set(id, symbol);
		if (withReverse) {
			this._reflectionIdsBySymbol.set(symbol, id);
		}
	}

	/** @internal */
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

	/** @internal */
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

	private async _analyzePackage(packageFolder: string, packageJson: PackageJson, tsconfig: ts.ParsedCommandLine) {
		const packageName = packageJson.name!;
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
			this.registerForPackageName(packageName, reflection);
			result.push(reflection);
		}

		this._symbolsByPackage.set(packageName, result);
	}
}
