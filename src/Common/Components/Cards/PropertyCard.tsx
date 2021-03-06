import { makeStyles } from '@material-ui/styles';
import React from 'react';
import Card from '../../Containers/Card';
import type { AccessorReferenceNode, PropertyReferenceNode } from '../../reference';
import { getTag, hasTag, isStringLiteral } from '../../Tools/CodeTools';
import MarkdownParser from '../../Tools/MarkdownParser';
import { getAnchorName } from '../../Tools/NodeTools';
import Badge from '../Badge';
import Type from '../CodeBuilders/Type';
import DeprecationNotice from '../DeprecationNotice';
import CardToolbar from './CardToolbar';

interface PropertyCardProps {
	name?: string;
	definition: PropertyReferenceNode | AccessorReferenceNode;
}

const useStyles = makeStyles({
	root: {},
	name: {
		display: 'inline-block'
	},
	toolbar: {
		opacity: 0,
		transition: 'opacity .5s ease-in-out',

		'$root:hover &': {
			opacity: 1
		}
	}
}, { name: 'PropertyCard' });

const PropertyCard: React.FC<PropertyCardProps> = ({ name, definition }) => {
	const classes = useStyles();

	const sig = definition.kind === 'accessor' ? definition.getSignature?.[0] : definition;
	const type = sig?.type;
	return (
		<Card className={classes.root} id={getAnchorName(definition, name)} key={definition.id}>
			<CardToolbar className={classes.toolbar} name={name} definition={definition}/>
			<h3 className={classes.name}>{name ?? definition.name}</h3>
			{definition.flags?.isStatic && <Badge>static</Badge>}
			{type ? <h4>{isStringLiteral(type) ? 'Value' : 'Type'}: <Type def={type} isOptional={definition.flags?.isOptional}/></h4> : null}
			{hasTag(definition, 'deprecated') && (
				<DeprecationNotice>
					<MarkdownParser source={getTag(definition, 'deprecated')!}/>
				</DeprecationNotice>
			)}
			{definition.comment?.shortText ? <MarkdownParser source={definition.comment.shortText}/> : null}
			{definition.comment?.text ? <MarkdownParser source={definition.comment.text}/> : null}
		</Card>
	);
};

export default PropertyCard;
