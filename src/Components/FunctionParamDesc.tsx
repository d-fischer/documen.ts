import * as React from 'react';
import * as Icon from 'react-fontawesome';

import { buildType } from '../Tools/CodeBuilders';
import { ReferenceSignatureNode } from '../Resources/data/reference';

import './FunctionParamDesc.scss';

interface FunctionParamDescProps {
	signature: ReferenceSignatureNode;
}

const FunctionParamDesc: React.SFC<FunctionParamDescProps> = ({ signature }) => (
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
				<td>{param.flags.isOptional ? '' : <Icon name="check"/>}</td>
				<td>{param.defaultValue || <em>none</em>}</td>
				<td>{param.comment && param.comment.shortText ? param.comment.shortText : <em>none</em>}</td>
			</tr>
		))}
		</tbody>
	</table>
);

export default FunctionParamDesc;
