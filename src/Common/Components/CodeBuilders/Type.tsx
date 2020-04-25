import React from 'react';
import { ReferenceNodeKind } from '../../reference/ReferenceNodeKind';
import { findSymbolByMember } from '../../Tools/ReferenceTools';
import TypeAliasHint from '../TypeAliasHint';
import TypeLink from '../TypeLink';
import { ReferenceType } from '../../reference';

interface TypeProps {
	def?: ReferenceType;
	ignoreUndefined?: boolean;
	isOptional?: boolean;
}

const Type: React.FunctionComponent<TypeProps> = ({ def, ignoreUndefined = false, isOptional = false }) => {
	if (!def) {
		return <>void</>;
	}

	switch (def.type) {
		case 'union': {
			const types = [...def.types];
			const trueIndex = types.findIndex(type => type.type === 'intrinsic' && type.name === 'true');
			const falseIndex = types.findIndex(type => type.type === 'intrinsic' && type.name === 'false');

			if (trueIndex !== -1 && falseIndex !== -1) {
				types.splice(trueIndex, 1, {
					type: 'intrinsic',
					name: 'boolean'
				});
				types.splice(falseIndex, 1);
			}

			if (types.length === 2) {
				const undefIndex = types.findIndex(type => type.type === 'intrinsic' && type.name === 'undefined');
				if (undefIndex !== -1) {
					const defIndex = +!undefIndex; // 0 => 1, 1 => 0 to find the type that isn't undefined
					if (ignoreUndefined) {
						return (
							<Type def={types[defIndex]} ignoreUndefined={true}/>
						);
					}
					return (
						<>
							?
							<Type def={types[defIndex]}/>
						</>
					);
				}
			}

			if (isOptional && types.length === 1) {
				return (
					<>
						?
						<Type def={types[0]}/>
					</>
				);
			}

			return (
				<>
					{types.map((type, idx) => (
						<React.Fragment key={idx}>
							{idx === 0 ? '' : ' | '}
							<Type def={type}/>
						</React.Fragment>
					))}
				</>
			);
		}
		case 'array': {
			return <>Array&lt;<Type def={def.elementType}/>&gt;</>;
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
											{i === 0 ? null : ', '}{param.name}: <Type def={param.type}/>
										</React.Fragment>
									)) : null}
									) =&gt; <Type def={signature.type}/>
								</>
							);
						}
						default: {
							// eslint-disable-next-line no-console
							console.log(`unknown reflection signature type: ${signature.kindString} (${signature.kind})`);
							return null;
						}
					}
				}
			}
			// if it doesn't have a signature, it's an anonymous object (as far as we know)
			return <>object</>;
		}
		case 'reference': {
			if (def.id) {
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
					{isOptional && '?'}
					<TypeLink name={def.name} id={def.id}>{def.name}</TypeLink>
					{def.typeArguments ? (
						<>
							&lt;
							{def.typeArguments.map((param, idx) => (
								<React.Fragment key={idx}>
									{idx === 0 ? '' : ', '}
									<Type def={param}/>
								</React.Fragment>
							))}
							&gt;
						</>
					) : null}
				</>
			);
		}
		default: {
			return (
				<>{def.name}</>
			);
		}
	}
};

export default Type;
