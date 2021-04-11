import type { ReferenceNode, ReferenceReferenceType, ReferenceType } from '../reference';
import { hasTag } from './CodeTools';

export function checkVisibility(node: ReferenceNode, parent?: ReferenceNode) {
	if (node.flags?.isPrivate) {
		return false;
	}

	if (node.flags?.isProtected && (!parent || hasTag(parent, 'hideprotected'))) {
		return false;
	}

	// things with no parent are root exports and should be hidden if they're re-exports from external packages
	if (!parent && node.flags?.isExternal) {
		return false;
	}

	// noinspection RedundantIfStatementJS - to make it clearer, we use only if statements here
	if (node.inheritedFrom && !(parent && hasTag(parent, 'inheritdoc'))) {
		return false;
	}

	return true;
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
