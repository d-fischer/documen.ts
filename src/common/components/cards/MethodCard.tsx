import { makeStyles } from '@material-ui/styles';
import React from 'react';
import Card from '../../containers/Card';
import type { CallSignatureReferenceNode, ClassReferenceNode, ConstructorReferenceNode, ConstructSignatureReferenceNode, InterfaceReferenceNode, MethodReferenceNode } from '../../reference';
import MarkdownParser from '../../tools/markdown/MarkdownParser';
import { getAnchorName } from '../../tools/NodeTools';
import FunctionParamDesc from '../FunctionParamDesc';
import { FunctionReturnType } from '../FunctionReturnType';
import CardToolbar from './CardToolbar';
import { FunctionCardHeader } from './FunctionCardHeader';

interface MethodCardProps {
	parent: ClassReferenceNode | InterfaceReferenceNode;
	definition: ConstructorReferenceNode | MethodReferenceNode;
	sig: CallSignatureReferenceNode | ConstructSignatureReferenceNode;
	isConstructor?: boolean;
}

const useStyles = makeStyles(theme => ({
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
}), { name: 'MethodCard' });

const MethodCard: React.FC<MethodCardProps> = ({ parent, definition, sig, isConstructor }) => {
	const classes = useStyles();

	return (
		<Card className={classes.root} id={getAnchorName(definition, sig.name)} key={sig.id}>
			<CardToolbar className={classes.toolbar} definition={definition} signature={sig}/>
			<FunctionCardHeader parent={parent} definition={definition} sig={sig}/>
			{sig.comment?.shortText && <MarkdownParser source={sig.comment.shortText}/>}
			{sig.comment?.text && <MarkdownParser source={sig.comment.text}/>}
			<FunctionParamDesc functionDefinition={definition} signature={sig}/>
			{!isConstructor && <FunctionReturnType signature={sig as CallSignatureReferenceNode}/>}
		</Card>
	);
};

export default MethodCard;
