import * as React from 'react';
import { default as reference, ReferenceNode, ReferenceType, TypeAliasReferenceNode } from '../Reference';
import TypeLink from '../Components/TypeLink';
import { findByMember } from './ArrayTools';
import TypeAliasHint from '../Components/TypeAliasHint';
import { ReferenceNodeKind } from '../Reference/ReferenceNodeKind';

export const buildType = (def?: ReferenceType): React.ReactNode => {
	if (!def) {
		return 'void';
	}

	switch (def.type) {
		case 'union': {
			if (def.types.length === 2) {
				const undefIndex = def.types.findIndex(type => type.type === 'intrinsic' && type.name === 'undefined');
				if (undefIndex !== -1) {
					const defIndex = +!undefIndex; // 0 => 1, 1 => 0 to find the type that isn't undefined
					return <>?{buildType(def.types[defIndex])}</>;
				}
			}
			return (
				<>
					{def.types.map((type, idx) => (
						<React.Fragment key={idx}>
							{idx !== 0 ? ' | ' : ''}
							{buildType(type)}
						</React.Fragment>
					))}
				</>
			);
		}
		case 'array': {
			return <>{buildType(def.elementType)}[]</>;
		}
		case 'stringLiteral': {
			return <>"{def.value}"</>;
		}
		case 'reflection': {
			// TODO
			return '';
		}
		default: {
			if (def.type === 'reference' && def.id) {
				const referencedType: TypeAliasReferenceNode | undefined = findByMember(reference.children, 'id', def.id);
				if (referencedType && referencedType.kind === ReferenceNodeKind.TypeAlias) {
					return <TypeAliasHint name={referencedType.name} type={referencedType.type} />;
				}
			}
			return (
				<>
					{def.type === 'reference' && def.id ? <TypeLink name={def.name}>{def.name}</TypeLink> : def.name}{def.type === 'reference' && def.typeArguments ? (
					<>
						&lt;
						{def.typeArguments.map((param, idx) => (
							<React.Fragment key={idx}>
								{idx !== 0 ? ', ' : ''}
								{buildType(param)}
							</React.Fragment>
						))}
						&gt;
					</>
				) : null}
				</>
			);
		}
	}
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
