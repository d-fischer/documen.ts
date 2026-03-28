import { makeStyles } from '@mui/styles';
import React from 'react';
import Card from '../../containers/Card.js';
import type { AccessorReferenceNode, PropertyReferenceNode } from '../../reference/index.js';
import { getTag, hasTag, isLiteral } from '../../tools/CodeTools.js';
import MarkdownParser from '../../tools/markdown/MarkdownParser.js';
import { getAnchorName } from '../../tools/NodeTools.js';
import Badge from '../Badge.js';
import BetaNotice from '../BetaNotice.js';
import Type from '../codeBuilders/Type.js';
import DeprecationNotice from '../DeprecationNotice.js';
import CardToolbar from './CardToolbar.js';

interface PropertyCardProps {
	name?: string;
	definition: PropertyReferenceNode | AccessorReferenceNode;
}

const useStyles = makeStyles(
	{
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
	},
	{ name: 'PropertyCard' }
);

const PropertyCard: React.FC<PropertyCardProps> = ({ name, definition }) => {
	const classes = useStyles();

	const sig = definition.kind === 'accessor' ? definition.getSignature : definition;
	if (!sig) {
		return null;
	}

	const { type } = sig;
	return (
		<Card className={classes.root} id={getAnchorName(definition, name)} key={definition.id}>
			<CardToolbar className={classes.toolbar} name={name} definition={definition} />
			<h3 className={classes.name}>{name ?? definition.name}</h3>
			{definition.flags?.isStatic && <Badge>static</Badge>}
			{
				<h4>
					{isLiteral(type) ? 'Value' : 'Type'}: <Type def={type} isOptional={definition.flags?.isOptional} />
				</h4>
			}
			{hasTag(sig, 'deprecated') && (
				<DeprecationNotice>
					<MarkdownParser source={getTag(sig, 'deprecated')!} />
				</DeprecationNotice>
			)}
			{hasTag(sig, 'beta') && <BetaNotice />}
			{sig.comment?.shortText ? <MarkdownParser source={sig.comment.shortText} /> : null}
			{sig.comment?.text ? <MarkdownParser source={sig.comment.text} /> : null}
		</Card>
	);
};

export default PropertyCard;
