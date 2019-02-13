import * as React from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import { buildType, hasTag, isOptionalType } from '../Tools/CodeBuilders';
import reference, { ParameterReferenceNode, PropertyReferenceNode, ReferenceCommentTag, SignatureReferenceNode, VariableReferenceNode } from '../Reference';

import './FunctionParamDesc.scss';
import parseMarkdown from '../Tools/MarkdownParser';
import { ReferenceNodeKind } from '../Reference/ReferenceNodeKind';
import { findByMember } from '../Tools/ArrayTools';

interface FunctionParamDescProps {
	signature: SignatureReferenceNode;
	additionalTags?: ReferenceCommentTag[];
	isCallback?: boolean;
}

const renderParam = (param: ParameterReferenceNode | VariableReferenceNode | PropertyReferenceNode, additionalTags?: ReferenceCommentTag[], isCallback?: boolean, expandParams?: boolean, paramNamePrefix: string = '') => {
	let desc = param.comment && (param.comment.text || param.comment.shortText);

	if (!desc && additionalTags) {
		const correctTag = additionalTags.find(tag => tag.tag === 'param' && tag.param === param.name);
		if (correctTag) {
			desc = correctTag.text;
		}
	}

	const paramName = paramNamePrefix + (param.name === '__namedParameters' ? 'params' : param.name);
	const defaultValue = param.kind === ReferenceNodeKind.Property ? undefined : param.defaultValue;

	let result: React.ReactNode[] = [];

	if (param.type.type === 'reflection' && param.type.declaration.children) {
		result.push(...param.type.declaration.children.map(
			(subParam: VariableReferenceNode) => renderParam(subParam, additionalTags, isCallback, expandParams, `${paramName}.`)
		));
	} else if (param.type.type === 'reference' && param.type.id && expandParams) {
		const ref = findByMember(reference.children, 'id', param.type.id);
		if (ref && ref.kind === ReferenceNodeKind.Interface) {
			result.push(...ref.children.map((subParam: PropertyReferenceNode) => renderParam(subParam, additionalTags, isCallback, expandParams, `${paramName}.`)))
		}
	}

	let typeDesc: React.ReactNode;

	if (param.type.type === 'reflection') {
		if (param.type.declaration.signatures && param.type.declaration.signatures.length) {
			typeDesc = 'function';
		} else {
			typeDesc = 'object';
		}
	} else {
		typeDesc = buildType(param.type, param.kind !== ReferenceNodeKind.Parameter || param.flags.isOptional);
	}

	result.unshift(
		<tr key={paramName}>
			<td>{paramName}</td>
			<td>{typeDesc}</td>
			{isCallback || (
				<>
					<td>{param.flags.isOptional || defaultValue || isOptionalType(param.type) ? '' : <Icon className="FunctionParamDesc__check" icon={faCheck}/>}</td>
					<td>{defaultValue || <em>none</em>}</td>
				</>
			)}
			<td>{desc ? parseMarkdown(desc) : <em>{result.length ? 'see below' : 'none'}</em>}</td>
		</tr>
	);

	return result;
};

const FunctionParamDesc: React.FC<FunctionParamDescProps> = ({ signature, additionalTags, isCallback }) => signature.parameters ? (
	<table className="FunctionParamDesc">
		<thead>
		<tr>
			<th>Parameter</th>
			<th>Type</th>
			{isCallback || (
				<>
					<th>Required</th>
					<th>Default</th>
				</>
			)}
			<th>Description</th>
		</tr>
		</thead>
		<tbody>
		{signature.parameters.map(param => renderParam(param, additionalTags, isCallback, hasTag(signature, 'expandParams')))}
		</tbody>
	</table>
) : null;

export default FunctionParamDesc;
