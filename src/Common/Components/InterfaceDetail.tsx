import React from 'react';
import type { MethodReferenceNode, PropertyReferenceNode, ReferenceNode } from '../reference';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import MethodCard from './Cards/MethodCard';
import PropertyCard from './Cards/PropertyCard';
import { defaultNodeSort, filterChildrenByMember } from '../Tools/NodeTools';

interface InterfaceDetailProps {
	symbol: ReferenceNode;
}

const InterfaceDetail: React.FC<InterfaceDetailProps> = ({ symbol }) => {
	const methods: MethodReferenceNode[] = filterChildrenByMember(symbol, 'kind', ReferenceNodeKind.Method);

	const properties: PropertyReferenceNode[] = filterChildrenByMember(symbol, 'kind', ReferenceNodeKind.Property);

	return (
		<>
			{methods.length ? (
				<>
					<h2>Methods</h2>
					{methods.sort(defaultNodeSort).map(method => method.signatures?.map(sig => <MethodCard key={sig.id} definition={method} sig={sig}/>))}
				</>
			) : null}
			{properties.length ? (
				<>
					<h2>Properties</h2>
					{properties.sort(defaultNodeSort).map(prop => <PropertyCard key={prop.id} definition={prop}/>)}
				</>
			) : null}
		</>
	);
};

export default InterfaceDetail;
