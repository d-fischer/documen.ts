import React from 'react';
import Card from '../Containers/Card';
import FunctionSignature from './FunctionSignature';
import FunctionParamDesc from './FunctionParamDesc';
import { ConstructorReferenceNode, MethodReferenceNode, SignatureReferenceNode } from '../reference';
import { getTag, hasTag } from '../Tools/CodeTools';

import parseMarkdown from '../Tools/MarkdownParser';
import DeprecationNotice from './DeprecationNotice';
import CardToolbar from './CardToolbar';
import Badge from './Badge';
import { makeStyles } from '@material-ui/styles';
import Type from './CodeBuilders/Type';

interface MethodCardProps {
	definition: ConstructorReferenceNode | MethodReferenceNode;
	sig: SignatureReferenceNode;
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
	returnTypeWrapper: {
		fontWeight: 'bold',
		margin: '1em 0 0'
	},
	returnType: {
		fontWeight: 'normal',
		fontFamily: theme.fonts.code
	}
}), { name: 'MethodCard' });

const MethodCard: React.FC<MethodCardProps> = ({ definition, sig, isConstructor }) => {
	const classes = useStyles();
	return (
		<Card className={classes.root} id={`${sig.name}`} key={sig.id}>
			<CardToolbar className={classes.toolbar} definition={definition} signature={sig}/>
			<FunctionSignature signature={sig} isConstructor={isConstructor}/>
			{definition.flags.isStatic && <Badge>static</Badge>}
			{hasTag(sig, 'deprecated') && <DeprecationNotice reason={parseMarkdown(getTag(sig, 'deprecated')!)}/>}
			{sig.comment && sig.comment.shortText && <p>{sig.comment.shortText}</p>}
			{sig.comment && sig.comment.text && parseMarkdown(sig.comment.text)}
			<FunctionParamDesc signature={sig}/>
			{!isConstructor && (
				<div className={classes.returnTypeWrapper}>
					Return type:{' '}
					<span className={classes.returnType}>
						<Type def={sig.type}/>
					</span>
				</div>
			)}
		</Card>
	);
};

export default MethodCard;
