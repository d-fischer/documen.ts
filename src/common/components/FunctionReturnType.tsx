import { makeStyles } from '@mui/styles';
import React from 'react';
import type { CallSignatureReferenceNode } from '../reference';
import { useAsyncType } from '../tools/NodeTools';
import Type from './codeBuilders/Type';

interface FunctionReturnTypeProps {
	signature: CallSignatureReferenceNode;
}

const useStyles = makeStyles(
	theme => ({
		root: {
			fontWeight: 'bold',
			margin: `${theme.spacing.unit * 2}px 0 0`
		},
		type: {
			fontWeight: 'normal'
		}
	}),
	{ name: 'FunctionReturnType' }
);

export const FunctionReturnType: React.FunctionComponent<FunctionReturnTypeProps> = ({ signature }) => {
	const classes = useStyles();

	const { returnType } = useAsyncType(signature);

	return (
		<div className={classes.root}>
			Return type:{' '}
			<span className={classes.type}>
				<Type def={returnType} />
			</span>
		</div>
	);
};
