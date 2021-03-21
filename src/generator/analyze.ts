import type { ReferenceNode } from '../common/reference';
import { Project } from './analyzer/Project';

interface ReferencePackage {
	packageName: string;
	symbols: ReferenceNode[];
}

async function main() {
	const packageNames = ['twitch-common', 'twitch'];
	const project = new Project();

	for (const pkg of packageNames) {
		await project.analyzePackage(pkg);
	}

	project.fixBrokenReferences();

	const packages: ReferencePackage[] = Object.entries(project.symbolsByPackage).map(([packageName, packageSymbols]) => ({
		packageName,
		symbols: packageSymbols.map(sym => sym.serialize())
	}));

	// eslint-disable-next-line no-console
	console.log(JSON.stringify({ packages }, null, 2));
}

void main();
