import * as path from 'path';
import * as ts from 'typescript';
import type { ReferenceNode } from '../common/reference';
import { parseConfig } from '../common/tools/ConfigTools';
import { AnalyzeContext } from './analyzer/AnalyzeContext';
import { createReflection } from './analyzer/createReflection';
import type { Reflection } from './analyzer/reflections/Reflection';
import { ReferenceType } from './analyzer/types/ReferenceType';
import { nodeToSymbol } from './analyzer/util/symbolUtil';

async function analyzePackage(name: string) {
	const parsedConfig = parseConfig(`packages/${name}/tsconfig.json`);
	const { options, fileNames } = parsedConfig;
	const prog = ts.createProgram({
		options,
		rootNames: fileNames
	});
	const checker = prog.getTypeChecker();
	const ctx = new AnalyzeContext(checker, name);
	const sf = prog.getSourceFile(path.join(process.cwd(), 'packages', name, 'src', 'index.ts'))!;
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
		reflection.registerForPackageName(name);
		result.push(reflection);
	}

	return result;
}

interface ReferencePackage {
	packageName: string;
	symbols: ReferenceNode[];
}

async function main() {
	const packageNames = ['twitch-common', 'twitch'];
	const symbolsByPackage: Record<string, Reflection[]> = {};
	for (const pkg of packageNames) {
		symbolsByPackage[pkg] = await analyzePackage(pkg);
	}

	ReferenceType.fixBrokenReferences();

	const packages: ReferencePackage[] = Object.entries(symbolsByPackage).map(([packageName, packageSymbols]) => ({
		packageName,
		symbols: packageSymbols.map(sym => sym.serialize())
	}));

	// eslint-disable-next-line no-console
	console.log(JSON.stringify({ packages }, null, 2));
}

void main();
