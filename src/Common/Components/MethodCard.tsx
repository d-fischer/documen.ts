import * as React from 'react';
import Card from '../Containers/Card';
import FunctionSignature from './FunctionSignature';
import FunctionParamDesc from './FunctionParamDesc';
import { ConstructorReferenceNode, MethodReferenceNode, SignatureReferenceNode } from '../Reference';
import { buildType, getTag, hasTag } from '../Tools/CodeBuilders';

import parseMarkdown from '../Tools/MarkdownParser';
import DeprecationNotice from './DeprecationNotice';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';
import CardToolbar from './CardToolbar';
import Badge from './Badge';

interface MethodCardProps {
	definition: ConstructorReferenceNode | MethodReferenceNode;
	sig: SignatureReferenceNode;
	isConstructor?: boolean;
}

const styles = createStyles(theme => ({
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
}));

const MethodCard: React.FC<MethodCardProps & WithSheet<typeof styles>> = ({ definition, sig, isConstructor, classes }) => (
	<Card className={classes.root} id={`symbol__${sig.name}`} key={sig.id}>
		<CardToolbar className={classes.toolbar} definition={definition} signature={sig} />
		<FunctionSignature signature={sig} isConstructor={isConstructor}/>
		{definition.flags.isStatic && <Badge>static</Badge>}
		{hasTag(sig, 'deprecated') && <DeprecationNotice reason={parseMarkdown(getTag(sig, 'deprecated')!)}/>}
		{sig.comment && sig.comment.shortText && <p>{sig.comment.shortText}</p>}
		{sig.comment && sig.comment.text && parseMarkdown(sig.comment.text)}
		<FunctionParamDesc signature={sig}/>
		{!isConstructor && (
			<div className={classes.returnTypeWrapper}>
				Return type: <span className={classes.returnType}>{buildType(sig.type)}</span>
			</div>
		)}
	</Card>
);

export default withStyles(styles)(MethodCard);
