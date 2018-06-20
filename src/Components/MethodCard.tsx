import * as React from 'react';
import Card from '../Containers/Card';
import FunctionSignature from './FunctionSignature';
import FunctionParamDesc from './FunctionParamDesc';
import { SignatureReferenceNode } from '../Resources/data/reference';
import { buildType } from '../Tools/CodeBuilders';

import './MethodCard.scss';
import parseMarkdown from '../Tools/MarkdownParser';

interface MethodCardProps {
	sig: SignatureReferenceNode;
	isConstructor?: boolean;
}

const MethodCard: React.SFC<MethodCardProps> = ({ sig, isConstructor }) => (
	<Card id={`symbol__${sig.name}`} key={sig.id} className="MethodCard">
		<FunctionSignature signature={sig} isConstructor={isConstructor}/>
		{sig.comment && sig.comment.shortText && <p>{sig.comment.shortText}</p>}
		{sig.comment && sig.comment.text && parseMarkdown(sig.comment.text)}
		<FunctionParamDesc signature={sig}/>
		{!isConstructor && <div className="MethodCard__returnType">Return type: <span>{buildType(sig.type)}</span></div>}
	</Card>
);

export default MethodCard;
