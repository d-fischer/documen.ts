import TypeLink from '../TypeLink';
import React from 'react';
import Type from './Type';
import type { ReferenceNode, ReferenceReferenceType, ReferenceType } from '../../reference';

interface ReferenceTypeProps {
	isOptional: boolean;
	def: ReferenceReferenceType | ReferenceNode;
	typeArguments?: ReferenceType[];
}

const ReferenceTypeView: React.FC<ReferenceTypeProps> = ({ isOptional, typeArguments, def }) => (
	<>
		{isOptional && '?'}
		<TypeLink name={def.name} id={def.id}>{def.name}</TypeLink>
		{typeArguments ? (
			<>
				&lt;
				{typeArguments.map((param, idx) => (
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

export default ReferenceTypeView;
