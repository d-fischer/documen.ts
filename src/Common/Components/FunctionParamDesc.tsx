import * as React from 'react';

import { hasTag } from '../Tools/CodeBuilders';
import { ReferenceCommentTag, SignatureReferenceNode } from '../Reference';

import FunctionParamDescEntry from './FunctionParamDescEntry';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';

interface FunctionParamDescProps {
	signature: SignatureReferenceNode;
	additionalTags?: ReferenceCommentTag[];
	isCallback?: boolean;
}

const styles = createStyles(theme => ({
	root: {
		border: `1px solid ${theme.colors.border}`,
		margin: '.5em 0'
	},
	heading: {
		padding: '.5em',
		backgroundColor: theme.colors.background.active
	}
}));

const FunctionParamDesc: React.FC<FunctionParamDescProps & WithSheet<typeof styles>> = ({ signature, additionalTags, isCallback, classes }) => signature.parameters ? (
	<table className={classes.root}>
		<thead>
		<tr>
			<th className={classes.heading}>Parameter</th>
			<th className={classes.heading}>Type</th>
			{isCallback || (
				<>
					<th className={classes.heading}>Required</th>
					<th className={classes.heading}>Default</th>
				</>
			)}
			<th className={classes.heading}>Description</th>
		</tr>
		</thead>
		<tbody>
		{signature.parameters.map(param => (
			<FunctionParamDescEntry
				param={param}
				additionalTags={additionalTags}
				isCallback={isCallback}
				expandParams={hasTag(signature, 'expandParams')}
			/>
		))}
		</tbody>
	</table>
) : null;

export default withStyles(styles)(FunctionParamDesc);
