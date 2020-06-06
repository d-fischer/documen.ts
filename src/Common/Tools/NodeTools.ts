import { AbstractReferenceNode, ReferenceNode } from '../reference';
import { filterByMember, findByMember } from './ArrayTools';

export function checkVisibility(node: ReferenceNode, parent?: AbstractReferenceNode) {
	if (node.flags.isPrivate) {
		return false;
	}

	if (node.flags.isProtected && parent?.comment?.tags?.some(tag => tag.tag === 'hideprotected')) {
		return false;
	}

	// noinspection RedundantIfStatementJS - to make it clearer, we use only if statements here
	if (node.inheritedFrom && parent?.comment?.tags?.some(tag => tag.tag === 'inheritdoc')) {
		return false;
	}

	return true;
}

export function getChildren(node: AbstractReferenceNode, withPrivate = false) {
	if (!node.children) {
		return [];
	}
	return withPrivate ? node.children : node.children.filter(child => checkVisibility(child, node));
}

export function findChildByMember<K extends keyof ReferenceNode, R extends ReferenceNode>(node: ReferenceNode, key: K, value: ReferenceNode[K], withPrivate = false) {
	return findByMember<ReferenceNode, K, R>(getChildren(node, withPrivate), key, value) as R | undefined;
}

export function filterChildrenByMember<K extends keyof ReferenceNode, R extends ReferenceNode>(node: ReferenceNode, key: K, value: ReferenceNode[K], withPrivate = false) {
	return filterByMember<ReferenceNode, K, R>(getChildren(node, withPrivate), key, value);
}
