import * as React from 'react';
import Card from '../Containers/Card';
import FunctionSignature from './FunctionSignature';
import FunctionParamDesc from './FunctionParamDesc';
import { SignatureReferenceNode } from '../Reference';
import { buildType, getTag, hasTag } from '../Tools/CodeBuilders';

import parseMarkdown from '../Tools/MarkdownParser';
import DeprecationNotice from './DeprecationNotice';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';

interface MethodCardProps {
	sig: SignatureReferenceNode;
	isConstructor?: boolean;
}

const styles = createStyles(theme => ({
	returnTypeWrapper: {
		fontWeight: 'bold',
		margin: '1em 0 0'
	},
	returnType: {
		fontWeight: 'normal',
		fontFamily: theme.fonts.code
	}
}));

const MethodCard: React.FC<MethodCardProps & WithSheet<typeof styles>> = ({ sig, isConstructor, classes }) => (
	<Card id={`symbol__${sig.name}`} key={sig.id}>
		<FunctionSignature signature={sig} isConstructor={isConstructor}/>
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
