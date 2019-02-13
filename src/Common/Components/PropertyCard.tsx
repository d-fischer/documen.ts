import * as React from 'react';
import Card from '../Containers/Card';
import { GetSignatureReferenceNode, PropertyReferenceNode } from '../Reference';
import { buildType, getTag, hasTag, isStringLiteral } from '../Tools/CodeBuilders';
import parseMarkdown from '../Tools/MarkdownParser';

interface PropertyCardProps {
	name?: string;
	definition: PropertyReferenceNode | GetSignatureReferenceNode;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ name, definition }) => (
	<Card id={`symbol__${name || definition.name}`} key={definition.id}>
		<h3>{name || definition.name}</h3>
		{definition.type ? <h4>{isStringLiteral(definition.type) ? 'Value' : 'Type'}: {buildType(definition.type)}</h4> : null}
		{hasTag(definition, 'deprecated') && (
			<div className="Card__deprecationNotice">
				<strong>Deprecated.</strong> {parseMarkdown(getTag(definition, 'deprecated')!)}
			</div>
		)}
		{definition.comment && definition.comment.shortText ? parseMarkdown(definition.comment.shortText) : null}
		{definition.comment && definition.comment.text ? parseMarkdown(definition.comment.text) : null}
	</Card>
);
export default PropertyCard;
