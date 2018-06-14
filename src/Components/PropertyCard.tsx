import * as React from 'react';
import Card from '../Containers/Card';
import { GetSignatureReferenceNode, PropertyReferenceNode } from '../Resources/data/reference';
import { buildType, isStringLiteral } from '../Tools/CodeBuilders';

interface PropertyCardProps {
	name?: string;
	definition: PropertyReferenceNode | GetSignatureReferenceNode;
}

const PropertyCard: React.SFC<PropertyCardProps> = ({ name, definition }) => (
	<Card key={definition.id}>
		<h3>{name || definition.name}</h3>
		{definition.type ? <h4>{isStringLiteral(definition.type) ? 'Value' : 'Type'}: {buildType(definition.type)}</h4> : null}
		{definition.comment && definition.comment.shortText ? <p>{definition.comment.shortText}</p> : null}
		{definition.comment && definition.comment.text ? <p>{definition.comment.text}</p> : null}
	</Card>
);
export default PropertyCard;
