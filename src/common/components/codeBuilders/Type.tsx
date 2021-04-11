import React from 'react';
import type { ReferenceType } from '../../reference';
import { findSymbolByMember } from '../../tools/ReferenceTools';
import TypeAliasHint from '../TypeAliasHint';
import ReferenceTypeView from './ReferenceTypeView';

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
		case 'literal': {
			return <>{def.value}</>;
		}
		case 'reflection': {
			const { signatures } = def.declaration;
			if (signatures?.length) {
				const [signature] = signatures;
				switch (signature.kind) {
					case 'callSignature': {
						return (
							<>
								(
								{signature.parameters.length ? signature.parameters.map((param, i) => (
									<React.Fragment key={param.name}>
										{i === 0 ? null : ', '}{param.name}: <Type def={param.type}/>
									</React.Fragment>
								)) : null}
								) =&gt; <Type def={signature.type}/>
							</>
						);
					}
					default: {
						// eslint-disable-next-line no-console,@typescript-eslint/restrict-template-expressions
						console.log(`unknown reflection signature type: ${signature.kind}`);
						return null;
					}
				}
			}
			// if it doesn't have a signature, it's an anonymous object (as far as we know)
			return <>
				{isOptional ? '?' : ''}
				object
			</>;
		}
		case 'reference': {
			if (def.id) {
				const referencedDesc = findSymbolByMember('id', def.id);
				if (referencedDesc) {
					const { symbol: referencedType } = referencedDesc;
					if (referencedType.kind === 'typeAlias') {
						return <TypeAliasHint symbol={referencedType}/>;
					}
					// TODO forward the CORRECT type arguments if this is a superclass
					return <ReferenceTypeView def={referencedType} typeArguments={def.typeArguments} isOptional={isOptional}/>;
				}
			}
			return <ReferenceTypeView def={def} typeArguments={def.typeArguments} isOptional={isOptional}/>;
		}
		case 'tuple': {
			return <>[{def.elements.map((type, idx) => (
				<React.Fragment key={idx}>
					{idx === 0 ? '' : ', '}
					<Type def={type as ReferenceType}/>
				</React.Fragment>
			))}]</>
		}
		case 'optional': {
			return (
				<>
					?
					<Type def={def.elementType}/>
				</>
			)
		}
		case 'typeOperator': {
			return (
				<>
					{def.operator} <Type def={def.target}/>
				</>
			)
		}
		default: {
			return (
				<>
					{isOptional ? '?' : ''}
					{def.name}
				</>
			);
		}
	}
};

export default Type;
