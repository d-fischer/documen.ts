import * as path from 'path';
import * as ts from 'typescript';
import type { ReferenceNode } from '../common/reference';
import { parseConfig } from '../common/tools/ConfigTools';
import { createReflection } from './analyzer/createReflection';
import type { Reflection } from './analyzer/reflections/Reflection';
import { nodeToSymbol } from './analyzer/util/symbolUtil';

const rootSymbols = new Map<number, Reflection>();

async function analyzePackage(name: string) {
	const parsedConfig = parseConfig(`packages/${name}/tsconfig.json`);
	const { options, fileNames } = parsedConfig;
	const prog = ts.createProgram({
		options,
		rootNames: fileNames
	});
	const checker = prog.getTypeChecker();
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
			return nodeToSymbol(checker, id);
		});

	for (const sym of fileExports) {
		const s = await createReflection(checker, sym);
		rootSymbols.set(s.id, s);
	}

	// console.error(fileExports);
}

async function main() {
	await analyzePackage('twitch-common');
	await analyzePackage('twitch');

	const entries: ReferenceNode[] = [];

	for (const [, sym] of rootSymbols) {
		entries.push(sym.serialize());
	}

	// eslint-disable-next-line no-console
	console.log(JSON.stringify({ entries }, null, 2));
}

void main();
