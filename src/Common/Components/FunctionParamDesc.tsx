import * as React from 'react';
import * as Icon from 'react-fontawesome';

import { buildType } from '../Tools/CodeBuilders';
import { ReferenceCommentTag, SignatureReferenceNode } from '../Reference';

import './FunctionParamDesc.scss';
import parseMarkdown from '../Tools/MarkdownParser';

interface FunctionParamDescProps {
	signature: SignatureReferenceNode;
	additionalTags?: ReferenceCommentTag[];
	isCallback?: boolean;
}

const FunctionParamDesc: React.SFC<FunctionParamDescProps> = ({ signature, additionalTags, isCallback }) => signature.parameters ? (
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
		{signature.parameters.map(param => {
			let desc = param.comment && (param.comment.text || param.comment.shortText);

			if (!desc && additionalTags) {
				const correctTag = additionalTags.find(tag => tag.tag === 'param' && tag.param === param.name);
				if (correctTag) {
					desc = correctTag.text;
				}
			}

			return (
				<tr key={param.name}>
					<td>{param.name}</td>
					<td>{buildType(param.type)}</td>
					{isCallback || (
						<>
							<td>{param.flags.isOptional || param.defaultValue ? '' : <Icon name="check"/>}</td>
							<td>{param.defaultValue || <em>none</em>}</td>
						</>
					)}
					<td>{desc ? parseMarkdown(desc) : <em>none</em>}</td>
				</tr>
			);
		})}
		</tbody>
	</table>
) : null;

export default FunctionParamDesc;
