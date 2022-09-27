import type { ExternalPackageReference, ReferenceNode, ReferenceType } from '../reference';

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

	const foundTag = node.comment?.tags?.find(tag => tag.tag === name);
	return foundTag ? foundTag.text ?? '' : null;
};

export const hasTag = (node: ReferenceNode, name: string): boolean => getTag(node, name) !== null;

export const isLiteral = (def?: ReferenceType): boolean => {
	if (!def) {
		return false;
	}

	switch (def.type) {
		case 'literal':
			return true;
		case 'union':
			return def.types.every(isLiteral);
		default:
			return false;
	}
};

export const getPageTypeForNodeKind = (kind: string): string => {
	switch (kind) {
		case 'class':
			return 'classes';
		case 'interface':
			return 'interfaces';
		case 'function':
			return 'functions';
		case 'typeAlias':
			return 'types';
		case 'enum':
			return 'enums';
		default:
			return 'unknown';
	}
};

export const getPageType = (node: ReferenceNode): string => getPageTypeForNodeKind(node.kind);

export function createExternalLink(ref?: ExternalPackageReference): string | null {
	if (ref?.generator !== 'documen.ts') {
		return null;
	}

	// TODO link to monorepo support & different router config
	return `${ref.baseUrl.replace(/\/$/, '')}/reference/${getPageTypeForNodeKind(ref.nodeKind)}/${
		ref.originalName
	}.html`;
}
