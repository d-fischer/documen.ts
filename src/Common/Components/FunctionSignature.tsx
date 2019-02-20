import * as React from 'react';
import { SignatureReferenceNode } from '../Reference';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';

interface FunctionSignatureProps {
	signature: SignatureReferenceNode;
	isConstructor?: boolean;
}

const styles = createStyles(theme => ({
	root: {
		fontFamily: theme.fonts.code,
		margin: '0 0 .5em',
		display: 'inline-block'
	}
}));

const FunctionSignature: React.FC<FunctionSignatureProps & WithSheet<typeof styles>> = ({ signature, classes }) => (
	<h3 className={classes.root}>
		{signature.name}({signature.parameters && signature.parameters.map((param, idx) => (
			<React.Fragment key={param.name}>
				{idx !== 0 ? ', ' : ''}
				{param.name === '__namedParameters' ? 'params' : param.name}
			</React.Fragment>
		))})
	</h3>
);

export default withStyles(styles)(FunctionSignature);
