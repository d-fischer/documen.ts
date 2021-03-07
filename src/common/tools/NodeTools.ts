import type { ReferenceNode, ReferenceReferenceType, ReferenceType } from '../reference';
import { filterByMember, findByMember } from './ArrayTools';
import { hasTag } from './CodeTools';

export function checkVisibility(node: ReferenceNode, parent?: ReferenceNode) {
	if (node.flags?.isPrivate) {
		return false;
	}

	if (node.flags?.isProtected && (!parent || hasTag(parent, 'hideprotected'))) {
		return false;
	}

	if (node.inheritedFrom && !(parent && hasTag(parent, 'inheritdoc'))) {
		return false;
	}

	// noinspection RedundantIfStatementJS - to make it clearer, we use only if statements here
	if (parent && parent.kind !== 'package' && node.flags?.isExternal && !hasTag(parent, 'inheritdoc')) {
		return false;
	}

	return true;
}

export function getChildren(node: ReferenceNode, withPrivate = false) {
	if (!node.children) {
		return [];
	}
	return withPrivate ? node.children : node.children.filter(child => checkVisibility(child, node));
}

export function findChildByMember<K extends keyof ReferenceNode, R extends ReferenceNode>(node: ReferenceNode, key: K, value: ReferenceNode[K], withPrivate = false) {
	return findByMember<ReferenceNode, K, R>(getChildren(node, withPrivate), key, value);
}

export function filterChildrenByMember<K extends keyof ReferenceNode, R extends ReferenceNode>(node: ReferenceNode, key: K, value: ReferenceNode[K], withPrivate = false) {
	return filterByMember<ReferenceNode, K, R>(getChildren(node, withPrivate), key, value);
}

export function defaultNodeSort<T extends ReferenceNode>(a: T, b: T) {
	const aStatic = !!a.flags?.isStatic;
	const bStatic = !!b.flags?.isStatic;
	if (aStatic !== bStatic) {
		return +bStatic - +aStatic;
	}

	return a.name.localeCompare(b.name);
}

export function getAnchorName(node: ReferenceNode, name?: string) {
	const modifiers = [];
	if (node.flags?.isStatic) {
		modifiers.push('s');
	}
	return [...modifiers, name ?? node.name].join('_');
}

export function typeIsAsync(type: ReferenceType): type is ReferenceReferenceType {
	return type.type === 'reference' && type.name === 'Promise' && !type.id;
}
