import { makeStyles } from '@material-ui/styles';
import React from 'react';
import type { CallSignatureReferenceNode } from '../reference';
import { useAsyncType } from '../tools/NodeTools';
import Type from './codeBuilders/Type';

interface FunctionReturnTypeProps {
	signature: CallSignatureReferenceNode;
}

const useStyles = makeStyles(theme => ({
	root: {
		fontWeight: 'bold',
		margin: '1em 0 0'
	},
	type: {
		fontWeight: 'normal',
		fontFamily: theme.fonts.code
	}
}), { name: 'FunctionReturnType' });

export const FunctionReturnType: React.FunctionComponent<FunctionReturnTypeProps> = ({signature}) => {
	const classes = useStyles();

	const { returnType } = useAsyncType(signature);

	return (
		<div className={classes.root}>
			Return type:{' '}
			<span className={classes.type}>
				<Type def={returnType}/>
			</span>
		</div>
	)
};
