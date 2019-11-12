import React from 'react';
import { ReferenceNode, ReferenceType } from '../reference';
import TypeLink from '../Components/TypeLink';
import TypeAliasHint from '../Components/TypeAliasHint';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import { findSymbolByMember } from './ReferenceTools';

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

export const buildType = (def?: ReferenceType, ignoreUndefined: boolean = false): React.ReactNode => {
	if (!def) {
		return 'void';
	}

	switch (def.type) {
		case 'union': {
			if (def.types.length === 2) {
				const undefIndex = def.types.findIndex(type => type.type === 'intrinsic' && type.name === 'undefined');
				if (undefIndex !== -1) {
					const defIndex = +!undefIndex; // 0 => 1, 1 => 0 to find the type that isn't undefined
					if (ignoreUndefined) {
						return buildType(def.types[defIndex], true);
					}
					return <>?{buildType(def.types[defIndex])}</>;
				}
			}
			return (
				<>
					{def.types.map((type, idx) => (
						<React.Fragment key={idx}>
							{idx === 0 ? '' : ' | '}
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
			return <>&quot;{def.value}&quot;</>;
		}
		case 'reflection': {
			const { signatures } = def.declaration;
			if (signatures) {
				const [signature] = signatures;
				if (signature) {
					switch (signature.kind) {
						case ReferenceNodeKind.CallSignature: {
							return (
								<>
									(
									{signature.parameters ? signature.parameters.map((param, i) => (
										<React.Fragment key={param.name}>
											{i === 0 ? null : ', '}{param.name}: {buildType(param.type)}
										</React.Fragment>
									)) : null}
									) =&gt; {buildType(signature.type)}
								</>
							);
						}
						default: {
							// eslint-disable-next-line no-console
							console.log(`unknown reflection signature type: ${signature.kindString} (${signature.kind})`);
							return '';
						}
					}
				}
			}
			// if it doesn't have a signature, it's an anonymous object (as far as we know)
			return 'object';
		}
		default: {
			if (def.type === 'reference' && def.id) {
				const referencedDesc = findSymbolByMember('id', def.id);
				if (referencedDesc) {
					const { symbol: referencedType } = referencedDesc;
					if (referencedType.kind === ReferenceNodeKind.TypeAlias) {
						return <TypeAliasHint name={referencedType.name} type={referencedType.type}/>;
					}
				}
			}
			return (
				<>
					{def.type === 'reference' ? <TypeLink name={def.name} id={def.id}>{def.name}</TypeLink> : def.name}{def.type === 'reference' && def.typeArguments ? (
					<>
						&lt;
						{def.typeArguments.map((param, idx) => (
							<React.Fragment key={idx}>
								{idx === 0 ? '' : ', '}
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
