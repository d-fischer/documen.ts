import { ReferenceNode, ReferenceType } from '../reference';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';

export const isOptionalType = (def?: ReferenceType) => {
	if (!def) {
		return true;
	}

	if (def.type === 'union') {
		if (def.types.length === 2) {
			const undefIndex = def.types.findIndex(type => type.type === 'intrinsic' && type.name === 'undefined');
			if (undefIndex !== -1) {
				return true;
			}
		}
	}

	return false;
};

export const getTag = (node: ReferenceNode, name: string): string | null => {
	name = name.toLowerCase();
	if (!node || !node.comment || !node.comment.tags) {
		return null;
	}

	const foundTag = node.comment.tags.find(tag => tag.tag === name);
	return foundTag ? foundTag.text : null;
};

export const hasTag = (node: ReferenceNode, name: string): boolean => getTag(node, name) !== null;

export const isStringLiteral = (def?: ReferenceType): boolean => {
	if (!def) {
		return false;
	}

	switch (def.type) {
		case 'stringLiteral':
			return true;
		case 'union':
			return def.types.every(isStringLiteral);
		default:
			return false;
	}
};

export const getPageType = (node: ReferenceNode): string => {
	switch (node.kind) {
		case ReferenceNodeKind.Class:
			return 'classes';
		case ReferenceNodeKind.Enum:
			return 'enums';
		case ReferenceNodeKind.Interface:
			return 'interfaces';
		default:
			return 'unknown';
	}
};
