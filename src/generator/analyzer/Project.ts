import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { parseConfig } from '../../common/tools/ConfigTools';
import { AnalyzeContext } from './AnalyzeContext';
import { createReflection } from './createReflection';
import type { Reflection } from './reflections/Reflection';
import type { SymbolBasedReflection } from './reflections/SymbolBasedReflection';
import type { ReferenceType } from './types/ReferenceType';
import { nodeToSymbol } from './util/symbolUtil';

export class Project {
	readonly symbolsByPackage = new Map<string, Reflection[]>();

	private readonly _reflectionsById = new Map<number, Reflection>();
	private readonly _packageNamesByReflectionId = new Map<number, string>();
	private _nextReflectionId = 1;

	private readonly _symbolsByReflectionId = new Map<number, ts.Symbol>();
	private readonly _reflectionIdsBySymbol = new Map<ts.Symbol, number>();
	private readonly _brokenReferences = new Map<ts.Symbol, ReferenceType[]>();

	constructor(public readonly baseDir: string) {
	}

	async analyzePackage(name: string) {
		const packageFolder = path.join(this.baseDir, 'packages', name);
		const parsedConfig = parseConfig(path.join(packageFolder, 'tsconfig.json'));
		const { options, fileNames } = parsedConfig;
		const prog = ts.createProgram({
			options,
			rootNames: fileNames
		});
		const checker = prog.getTypeChecker();
		const ctx = new AnalyzeContext(this, checker, name);

		const pathToEntryPoint = this._getEntryPointForPackageFolder(packageFolder, parsedConfig);
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
			this.registerForPackageName(name, reflection);
			result.push(reflection);
		}

		this.symbolsByPackage.set(name, result);
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

	protected _getEntryPointForPackageFolder(dir: string, tsconfig: ts.ParsedCommandLine) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
		let mainJsFile: string = pkg.main;
		const lastPathPart = mainJsFile.split(path.delimiter).reverse()[0];
		if (!/\.m?js]$/.test(lastPathPart)) {
			mainJsFile = path.join(mainJsFile, 'index.js');
		}

		const fullOutPath = path.join(dir, mainJsFile);
		const innerOutPath = path.relative(tsconfig.options.outDir!, fullOutPath);
		return path.join(tsconfig.options.rootDir!, innerOutPath.replace(/\.m?js$/, '.ts'));
	}
}
