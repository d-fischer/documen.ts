import { makeStyles } from '@mui/styles';
import React from 'react';
import Card from '../../containers/Card.js';
import type {
	CallSignatureReferenceNode,
	ClassReferenceNode,
	ConstructorReferenceNode,
	ConstructSignatureReferenceNode,
	InterfaceReferenceNode,
	MethodReferenceNode
} from '../../reference/index.js';
import MarkdownParser from '../../tools/markdown/MarkdownParser.js';
import { getAnchorName } from '../../tools/NodeTools.js';
import FunctionParamDesc from '../FunctionParamDesc.js';
import { FunctionReturnType } from '../FunctionReturnType.js';
import CardToolbar from './CardToolbar.js';
import { FunctionCardHeader } from './FunctionCardHeader.js';

interface MethodCardProps {
	parent: ClassReferenceNode | InterfaceReferenceNode;
	definition: ConstructorReferenceNode | MethodReferenceNode;
	sig: CallSignatureReferenceNode | ConstructSignatureReferenceNode;
	isConstructor?: boolean;
}

const useStyles = makeStyles(
	theme => ({
		root: {},
		toolbar: {
			opacity: 0,
			transition: 'opacity .5s ease-in-out',

			'$root:hover &': {
				opacity: 1
			}
		},
		asyncBadge: {
			backgroundColor: theme.colors.badges.async
		},
		returnTypeWrapper: {
			fontWeight: 'bold',
			margin: '1em 0 0'
		},
		returnType: {
			fontWeight: 'normal',
			fontFamily: theme.fonts.code
		}
	}),
	{ name: 'MethodCard' }
);

const MethodCard: React.FC<MethodCardProps> = ({ parent, definition, sig, isConstructor }) => {
	const classes = useStyles();

	const comment = sig.comment ?? definition.comment;

	return (
		<Card className={classes.root} id={getAnchorName(definition, sig.name)} key={sig.id}>
			<CardToolbar className={classes.toolbar} definition={definition} signature={sig} />
			<FunctionCardHeader parent={parent} definition={definition} sig={sig} />
			{comment?.shortText && <MarkdownParser source={comment.shortText} />}
			{comment?.text && <MarkdownParser source={comment.text} />}
			<FunctionParamDesc functionDefinition={definition} signature={sig} />
			{!isConstructor && <FunctionReturnType signature={sig as CallSignatureReferenceNode} />}
		</Card>
	);
};

export default MethodCard;
