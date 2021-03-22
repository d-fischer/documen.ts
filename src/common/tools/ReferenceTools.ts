import type { ClassReferenceNode, ReferenceNode } from '../reference';
import reference from '../reference';
import { filterByMember, findByMember } from './ArrayTools';
import { checkVisibility } from './NodeTools';

interface SymbolDefinition<T extends ReferenceNode> {
	symbol: T;
	packageName?: string;
}

export function findSymbolByMember<T extends ReferenceNode, K extends keyof T, R extends T>(key: K, value: T[K], pkgName?: string): SymbolDefinition<R> | undefined {
	// check for mono different here because there's no access to the context
	const isMono = reference.packages.length > 1;
	if (isMono) {
		for (const pkg of reference.packages) {
			if (pkgName && pkg.packageName !== pkgName) {
				continue;
			}
			const found = (filterByMember(pkg.symbols as T[], key, value) as ReferenceNode[]).find(f => f.kind !== 'reference');
			if (found) {
				if (checkVisibility(found)) {
					return {
						symbol: found as R,
						packageName: pkg.packageName
					};
				}
				if (found.kind === 'class') {
					const extendedType = found.extendedTypes?.[0];
					if (extendedType?.type === 'reference' && extendedType.id) {
						const parentClass = findSymbolByMember('id', extendedType.id);
						if (parentClass?.symbol && checkVisibility(parentClass.symbol)) {
							return parentClass as SymbolDefinition<R>;
						}
					}
				}
			}
		}
		return undefined;
	}

	const parent = reference.packages[0];

	const foundInParent = findByMember(parent.symbols as T[], key, value);

	if (foundInParent) {
		if (checkVisibility(foundInParent)) {
			return {
				symbol: foundInParent as R,
				packageName: undefined
			};
		}
		if (foundInParent.kind === 'class') {
			const extendedType = (foundInParent as ClassReferenceNode).extendedTypes?.[0];
			if (extendedType?.type === 'reference' && extendedType.id)
				return findSymbolByMember('id', extendedType.id);
		}
	}

	return undefined;
}

export function getPackageRoot(packageName?: string) {
	return packageName ? reference.packages.find(pkg => pkg.packageName === packageName) : reference.packages[0];
}

export function getPackageList() {
	return reference.packages;
}
