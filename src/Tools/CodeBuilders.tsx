import * as React from 'react';
import { ReferenceNode, ReferenceType } from '../Resources/data/reference';

export const buildType = (def?: ReferenceType): React.ReactNode => {
	if (!def) {
		return 'void';
	}

	switch (def.type) {
		case 'union': {
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
		default: {
			return (
				<>
					{def.name}{def.type === 'reference' && def.typeArguments ? (
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
