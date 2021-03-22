import type { ReferenceNode } from '../common/reference';
import { Project } from './analyzer/Project';

export interface SerializedPackage {
	packageName: string;
	symbols: ReferenceNode[];
}

export interface SerializedProject {
	packages: SerializedPackage[];
}

export async function analyzeMono(packageNames: string[], baseDir: string): Promise<SerializedProject> {
	const project = new Project(baseDir);

	for (const pkg of packageNames) {
		await project.analyzePackage(pkg);
	}

	project.fixBrokenReferences();

	const packages: SerializedPackage[] = [...project.symbolsByPackage.entries()].map(([packageName, packageSymbols]) => ({
		packageName,
		symbols: packageSymbols.map(sym => sym.serialize())
	}));

	return { packages };
}
