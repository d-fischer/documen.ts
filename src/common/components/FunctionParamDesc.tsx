import { makeStyles } from '@mui/styles';
import React from 'react';
import type {
	CallSignatureReferenceNode,
	ConstructorReferenceNode,
	ConstructSignatureReferenceNode,
	FunctionReferenceNode,
	MethodReferenceNode,
	PropertyReferenceNode
} from '../reference';

import { hasTag } from '../tools/CodeTools';

import FunctionParamDescEntry from './FunctionParamDescEntry';

interface FunctionParamDescProps {
	functionDefinition: FunctionReferenceNode | MethodReferenceNode | ConstructorReferenceNode | PropertyReferenceNode;
	signature: CallSignatureReferenceNode | ConstructSignatureReferenceNode;
	isCallback?: boolean;
}

const useStyles = makeStyles(
	theme => ({
		root: {
			border: `1px solid ${theme.colors.border}`,
			margin: `${theme.spacing.unit * 2}px 0`
		},
		heading: {
			padding: theme.spacing.unit,
			backgroundColor: theme.colors.background.active
		}
	}),
	{ name: 'FunctionParamDesc' }
);

const FunctionParamDesc: React.FC<FunctionParamDescProps> = ({ functionDefinition, signature, isCallback }) => {
	const classes = useStyles();
	if (!signature.parameters.length) {
		return null;
	}
	return (
		<table className={classes.root}>
			<thead>
				<tr>
					<th className={classes.heading}>Parameter</th>
					<th className={classes.heading}>Type</th>
					{isCallback ? null : (
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
						key={param.name}
						param={param}
						functionSignature={signature}
						functionDefinition={functionDefinition}
						isCallback={isCallback}
						expandParams={hasTag(signature, 'expandParams')}
					/>
				))}
			</tbody>
		</table>
	);
};

export default FunctionParamDesc;
