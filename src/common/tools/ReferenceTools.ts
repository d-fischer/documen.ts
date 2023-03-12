import type {
	ClassReferenceNode,
	EnumReferenceNode,
	InterfaceReferenceNode,
	ReferenceNode,
	TypeLiteralReferenceNode
} from '../reference';
import reference from '../reference';
import { filterByMember, findByMember } from './ArrayTools';
import { checkVisibility } from './NodeTools';

interface SymbolDefinition<T extends ReferenceNode> {
	symbol: T;
	packageName?: string;
}

export function findSymbolByMember<T extends ReferenceNode, K extends keyof T, R extends T = T>(
	key: K,
	value: T[K],
	pkgName?: string,
	withPrivate = false
): SymbolDefinition<R> | undefined {
	// check for mono different here because there's no access to the context
	const isMono = reference.packages.length > 1;
	if (isMono) {
		for (const pkg of reference.packages) {
			if (pkgName && pkg.packageName !== pkgName) {
				continue;
			}
			const found = (filterByMember(pkg.symbols as T[], key, value) as ReferenceNode[]).find(
				f => f.kind !== 'reference'
			);
			if (found) {
				if (withPrivate || checkVisibility(found)) {
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
			const extendedType = foundInParent.extendedTypes?.[0];
			if (extendedType?.type === 'reference' && extendedType.id) {
				return findSymbolByMember('id', extendedType.id);
			}
		}
	}

	return undefined;
}

const resolvedMemberCache = new WeakMap<ReferenceNode, ReferenceNode[]>();

export function getChildren(
	node: ClassReferenceNode | InterfaceReferenceNode | EnumReferenceNode | TypeLiteralReferenceNode,
	withPrivate = false
): ReferenceNode[] {
	function resolveMembers() {
		if (node.kind !== 'class' && node.kind !== 'interface') {
			return node.members;
		}

		const extendedClass = node.extendedTypes?.[0];
		if (extendedClass?.type !== 'reference' || !extendedClass.id) {
			return node.members;
		}
		const extendedClassNode = findSymbolByMember<ClassReferenceNode | InterfaceReferenceNode, 'id'>(
			'id',
			extendedClass.id,
			extendedClass.package,
			true
		);
		if (!extendedClassNode?.symbol) {
			return node.members;
		}

		const result = node.members.map((mem: ReferenceNode) => {
			if (mem.kind !== 'reference') {
				return mem;
			}

			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			return findChildByMember(extendedClassNode.symbol, 'id', mem.target) ?? mem;
		});

		resolvedMemberCache.set(node, result);
		return result;
	}

	const resolvedMembers = resolvedMemberCache.has(node) ? resolvedMemberCache.get(node)! : resolveMembers();

	return withPrivate ? resolvedMembers : resolvedMembers.filter(child => checkVisibility(child, node));
}

export function findChildByMember<K extends keyof ReferenceNode, R extends ReferenceNode>(
	node: ClassReferenceNode | InterfaceReferenceNode | EnumReferenceNode | TypeLiteralReferenceNode,
	key: K,
	value: ReferenceNode[K],
	withPrivate = false
) {
	return findByMember<ReferenceNode, K, R>(getChildren(node, withPrivate), key, value);
}

export function filterChildrenByMember<K extends keyof ReferenceNode, R extends ReferenceNode>(
	node: ClassReferenceNode | InterfaceReferenceNode | EnumReferenceNode | TypeLiteralReferenceNode,
	key: K,
	value: ReferenceNode[K],
	withPrivate = false
) {
	return filterByMember<ReferenceNode, K, R>(getChildren(node, withPrivate), key, value);
}

export function getPackageRoot(packageName?: string) {
	return packageName ? reference.packages.find(pkg => pkg.packageName === packageName) : reference.packages[0];
}

export function getPackageList() {
	return reference.packages;
}
