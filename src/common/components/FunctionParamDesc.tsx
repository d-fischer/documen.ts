import React from 'react';

import { hasTag } from '../tools/CodeTools';
import type { ReferenceCommentTag, SignatureReferenceNode } from '../reference';

import FunctionParamDescEntry from './FunctionParamDescEntry';
import { makeStyles } from '@material-ui/styles';

interface FunctionParamDescProps {
	signature: SignatureReferenceNode;
	additionalTags?: ReferenceCommentTag[];
	isCallback?: boolean;
}

const useStyles = makeStyles(theme => ({
	root: {
		border: `1px solid ${theme.colors.border}`,
		margin: `${theme.spacing.unit}px 0`
	},
	heading: {
		padding: theme.spacing.unit,
		backgroundColor: theme.colors.background.active
	}
}), { name: 'FunctionParamDesc' });

const FunctionParamDesc: React.FC<FunctionParamDescProps> = ({ signature, additionalTags, isCallback }) => {
	const classes = useStyles();
	if (!signature.parameters) {
		return null;
	}
	return <table className={classes.root}>
		<thead>
		<tr>
			<th className={classes.heading}>Parameter</th>
			<th className={classes.heading}>Type</th>
			{isCallback ? (
				<>
					<th className={classes.heading}>Required</th>
					<th className={classes.heading}>Default</th>
				</>
			) : null}
			<th className={classes.heading}>Description</th>
		</tr>
		</thead>
		<tbody>
		{signature.parameters.map(param => (
			<FunctionParamDescEntry
				key={param.name}
				param={param}
				additionalTags={additionalTags}
				isCallback={isCallback}
				expandParams={hasTag(signature, 'expandParams')}
			/>
		))}
		</tbody>
	</table>;
};

export default FunctionParamDesc;
