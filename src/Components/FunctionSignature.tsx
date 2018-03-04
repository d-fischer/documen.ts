import * as React from 'react';

import { ReferenceSignatureNode } from '../Resources/data/reference';
import { buildType } from '../Tools/CodeBuilders';

import './FunctionSignature.scss';

interface FunctionSignatureProps {
	signature: ReferenceSignatureNode;
	isConstructor: boolean;
}

const FunctionSignature: React.SFC<FunctionSignatureProps> = ({ signature, isConstructor }) => (
	<div className="FunctionSignature">
		{signature.name}({signature.parameters.map((param, idx) => (
			<React.Fragment key={param.name}>
				{idx !== 0 ? ', ' : ''}
				{param.name}
			</React.Fragment>
		)
	)}){isConstructor ? '' : <>: {buildType(signature.type)}</>}
	</div>
);

export default FunctionSignature;
