import React from 'react';
import { MethodReferenceNode, PropertyReferenceNode, ReferenceNode } from '../reference';
import { filterByMember } from '../Tools/ArrayTools';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import MethodCard from './MethodCard';
import PropertyCard from './PropertyCard';

interface InterfaceDetailProps {
	symbol: ReferenceNode;
}

const InterfaceDetail: React.FC<InterfaceDetailProps> = ({ symbol }) => {
	const methods: MethodReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Method);

	const properties: PropertyReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Property);

	return (
		<>
			{methods.length ? (
				<>
					<h2>Methods</h2>
					{methods.map(method => method.signatures && method.signatures.map(sig => <MethodCard key={sig.id} definition={method} sig={sig}/>))}
				</>
			) : null}
			{properties.length ? (
				<>
					<h2>Properties</h2>
					{properties.map(prop => <PropertyCard key={prop.id} definition={prop}/>)}
				</>
			) : null}
		</>
	);
};

export default InterfaceDetail;
