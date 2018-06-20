import * as React from 'react';
import * as Icon from 'react-fontawesome';

import { buildType } from '../Tools/CodeBuilders';
import { SignatureReferenceNode } from '../Resources/data/reference';

import './FunctionParamDesc.scss';
import parseMarkdown from '../Tools/MarkdownParser';

interface FunctionParamDescProps {
	signature: SignatureReferenceNode;
}

const FunctionParamDesc: React.SFC<FunctionParamDescProps> = ({ signature }) => signature.parameters ? (
	<table className="FunctionParamDesc">
		<thead>
		<tr>
			<th>Parameter</th>
			<th>Type</th>
			<th>Required</th>
			<th>Default</th>
			<th>Description</th>
		</tr>
		</thead>
		<tbody>
		{signature.parameters.map(param => (
			<tr key={param.name}>
				<td>{param.name}</td>
				<td>{buildType(param.type)}</td>
				<td>{param.flags.isOptional || param.defaultValue ? '' : <Icon name="check"/>}</td>
				<td>{param.defaultValue || <em>none</em>}</td>
				<td>{param.comment && param.comment.text ? parseMarkdown(param.comment.text) : <em>none</em>}</td>
			</tr>
		))}
		</tbody>
	</table>
) : null;

export default FunctionParamDesc;
