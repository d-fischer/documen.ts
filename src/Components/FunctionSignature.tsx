import * as React from 'react';

import { SignatureReferenceNode } from '../Resources/data/reference';

import './FunctionSignature.scss';

interface FunctionSignatureProps {
	signature: SignatureReferenceNode;
	isConstructor?: boolean;
}

const FunctionSignature: React.SFC<FunctionSignatureProps> = ({ signature }) => (
	<h3 className="FunctionSignature">
		{signature.name}({signature.parameters && signature.parameters.map((param, idx) => (
			<React.Fragment key={param.name}>
				{idx !== 0 ? ', ' : ''}
				{param.name}
			</React.Fragment>
		))})
	</h3>
);

export default FunctionSignature;
