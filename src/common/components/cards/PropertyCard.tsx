import { makeStyles } from '@material-ui/styles';
import React from 'react';
import Card from '../../containers/Card';
import type { AccessorReferenceNode, PropertyReferenceNode } from '../../reference';
import { getTag, hasTag, isStringLiteral } from '../../tools/CodeTools';
import MarkdownParser from '../../tools/MarkdownParser';
import { getAnchorName } from '../../tools/NodeTools';
import Badge from '../Badge';
import Type from '../codeBuilders/Type';
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

	const sig = definition.kind === 'accessor' ? definition.getSignature : definition;
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
			{sig?.comment?.shortText ? <MarkdownParser source={sig.comment.shortText}/> : null}
			{sig?.comment?.text ? <MarkdownParser source={sig.comment.text}/> : null}
		</Card>
	);
};

export default PropertyCard;
