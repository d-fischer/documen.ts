import * as React from 'react';
import Card from '../Containers/Card';
import FunctionSignature from './FunctionSignature';
import FunctionParamDesc from './FunctionParamDesc';
import { SignatureReferenceNode } from '../Resources/data/reference';

interface MethodCardProps {
	sig: SignatureReferenceNode;
	isConstructor?: boolean;
}

const MethodCard: React.SFC<MethodCardProps> = ({ sig, isConstructor }) => (
	<Card key={sig.id}>
		<FunctionSignature signature={sig} isConstructor={isConstructor}/>
		{sig.comment && sig.comment.shortText && <p>{sig.comment.shortText}</p>}
		<FunctionParamDesc signature={sig}/>
	</Card>
);

export default MethodCard;
