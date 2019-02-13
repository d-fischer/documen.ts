import * as React from 'react';

import { SignatureReferenceNode } from '../Reference';

import './FunctionSignature.scss';

interface FunctionSignatureProps {
	signature: SignatureReferenceNode;
	isConstructor?: boolean;
}

const FunctionSignature: React.FC<FunctionSignatureProps> = ({ signature }) => (
	<h3 className="FunctionSignature">
		{signature.name}({signature.parameters && signature.parameters.map((param, idx) => (
			<React.Fragment key={param.name}>
				{idx !== 0 ? ', ' : ''}
				{param.name === '__namedParameters' ? 'params' : param.name}
			</React.Fragment>
		))})
	</h3>
);

export default FunctionSignature;
