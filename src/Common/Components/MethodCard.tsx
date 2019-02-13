import * as React from 'react';
import Card from '../Containers/Card';
import FunctionSignature from './FunctionSignature';
import FunctionParamDesc from './FunctionParamDesc';
import { SignatureReferenceNode } from '../Reference';
import { buildType, getTag, hasTag } from '../Tools/CodeBuilders';

import './MethodCard.scss';
import parseMarkdown from '../Tools/MarkdownParser';

interface MethodCardProps {
	sig: SignatureReferenceNode;
	isConstructor?: boolean;
}

const MethodCard: React.FC<MethodCardProps> = ({ sig, isConstructor }) => (
	<Card id={`symbol__${sig.name}`} key={sig.id} className="MethodCard">
		<FunctionSignature signature={sig} isConstructor={isConstructor}/>
		{hasTag(sig, 'deprecated') && (
			<div className="Card__deprecationNotice">
				<strong>Deprecated.</strong> {parseMarkdown(getTag(sig, 'deprecated')!)}
			</div>
		)}
		{sig.comment && sig.comment.shortText && <p>{sig.comment.shortText}</p>}
		{sig.comment && sig.comment.text && parseMarkdown(sig.comment.text)}
		<FunctionParamDesc signature={sig}/>
		{!isConstructor && <div className="MethodCard__returnType">Return type: <span>{buildType(sig.type)}</span></div>}
	</Card>
);

export default MethodCard;
