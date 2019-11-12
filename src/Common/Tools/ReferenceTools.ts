import reference, { ReferenceNode } from '../reference';
import { findByMember } from './ArrayTools';
import { isMono } from '../config';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';

interface SymbolDefinition<T extends ReferenceNode> {
	symbol: T;
	packageName?: string;
}

export function findSymbolByMember<T extends ReferenceNode, K extends keyof T, R extends T>(key: K, value: T[K], parent?: ReferenceNode, packageName?: string): SymbolDefinition<R> | undefined {
	if (!parent) {
		if (isMono) {
			if (packageName) {
				parent = reference.children.find(pkg => pkg.name === packageName);
			}
			if (!parent) {
				for (const pkg of reference.children) {
					const found = findByMember(pkg.children as T[], key, value);
					if (found) {
						return {
							symbol: found as R,
							packageName: pkg.name
						};
					}
				}
				return undefined;
			}
		} else {
			parent = reference;
		}
	}

	const foundInParent = findByMember(parent.children as T[], key, value);

	if (foundInParent) {
		return {
			symbol: foundInParent as R,
			packageName
		};
	}

	return undefined;
}

export function getPackageRoot(packageName?: string) {
	return packageName ? reference.children.find(pkg => pkg.name === packageName) : reference;
}

export function getPackageList() {
	return reference.children.filter(child => child.kind === ReferenceNodeKind.Package).sort((a, b) => a.name.localeCompare(b.name));
}
