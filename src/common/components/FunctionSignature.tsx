import { makeStyles } from '@mui/styles';
import React from 'react';
import type {
	CallSignatureReferenceNode,
	ClassReferenceNode,
	ConstructSignatureReferenceNode,
	InterfaceReferenceNode
} from '../reference';

interface FunctionSignatureProps {
	signature: CallSignatureReferenceNode | ConstructSignatureReferenceNode;
	parent?: ClassReferenceNode | InterfaceReferenceNode;
}

const useStyles = makeStyles(
	theme => ({
		root: {
			fontFamily: theme.fonts.code,
			margin: '0 0 .5em',
			display: 'inline-block'
		}
	}),
	{ name: 'FunctionSignature' }
);

const FunctionSignature: React.FC<FunctionSignatureProps> = ({ signature, parent }) => {
	const classes = useStyles();

	let name = signature.name;

	if (signature.kind === 'constructSignature' && parent) {
		name = `new ${parent.name}`;
	}

	return (
		<h3 className={classes.root}>
			{name}
			{signature.kind === 'callSignature' && signature.typeParameters?.length && (
				<>
					&lt;
					{signature.typeParameters.map((typeParam, idx) => (
						<React.Fragment key={typeParam.name}>
							{idx === 0 ? '' : ', '}
							{typeParam.name}
						</React.Fragment>
					))}
					&gt;
				</>
			)}
			(
			{signature.parameters.map((param, idx) => (
				<React.Fragment key={param.name}>
					{idx === 0 ? '' : ', '}
					{/^__\d+$/.test(param.name) ? 'params' : param.name}
				</React.Fragment>
			))}
			)
		</h3>
	);
};

export default FunctionSignature;
