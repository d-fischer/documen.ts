import React from 'react';
import { SignatureReferenceNode } from '../reference';
import { makeStyles } from '@material-ui/styles';

interface FunctionSignatureProps {
	signature: SignatureReferenceNode;
	isConstructor?: boolean;
}

const useStyles = makeStyles(theme => ({
	root: {
		fontFamily: theme.fonts.code,
		margin: '0 0 .5em',
		display: 'inline-block'
	}
}), { name: 'FunctionSignature' });

const FunctionSignature: React.FC<FunctionSignatureProps> = ({ signature }) => {
	const classes = useStyles();
	return (
		<h3 className={classes.root}>
			{signature.name}
			{signature.typeParameter?.length && (
				<>
					&lt;
					{signature.typeParameter.map((typeParam, idx) => (
						<React.Fragment key={typeParam.name}>
							{idx === 0 ? '' : ', '}
							{typeParam.name}
						</React.Fragment>
					))}
					&gt;
				</>
			)}
			({signature.parameters && signature.parameters.map((param, idx) => (
			<React.Fragment key={param.name}>
				{idx === 0 ? '' : ', '}
				{param.name === '__namedParameters' ? 'params' : param.name}
			</React.Fragment>
		))})
		</h3>
	);
};

export default FunctionSignature;
