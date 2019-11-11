import { ParameterReferenceNode, PropertyReferenceNode, ReferenceCommentTag, VariableReferenceNode } from '../reference';
import * as React from 'react';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import { buildType, isOptionalType } from '../Tools/CodeBuilders';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import parseMarkdown from '../Tools/MarkdownParser';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';
import { findSymbolByMember } from '../Tools/ReferenceTools';

interface FunctionParamDescEntryProps {
	param: ParameterReferenceNode | VariableReferenceNode | PropertyReferenceNode;
	additionalTags?: ReferenceCommentTag[];
	isCallback?: boolean;
	expandParams?: boolean;
	paramNamePrefix?: string;
}

const styles = createStyles({
	row: {
		padding: '.5em',
		textAlign: 'center',

		'& p': {
			margin: 0,

			'& + p': {
				marginTop: '.5em'
			}
		}
	},
	checkMark: {
		width: '1em'
	}
});

let FunctionParamDescEntry: React.ComponentType<FunctionParamDescEntryProps>;

const PureFunctionParamDescEntry: React.FC<FunctionParamDescEntryProps & WithSheet<typeof styles>> = ({ param, additionalTags, isCallback, expandParams, paramNamePrefix = '', classes }) => {
	let desc = param.comment && (param.comment.text || param.comment.shortText);

	if (!desc && additionalTags) {
		const correctTag = additionalTags.find(tag => tag.tag === 'param' && tag.param === param.name);
		if (correctTag) {
			desc = correctTag.text;
		}
	}

	const paramName = paramNamePrefix + (param.name === '__namedParameters' ? 'params' : param.name);
	const defaultValue = param.kind === ReferenceNodeKind.Property ? undefined : param.defaultValue;

	const result: React.ReactNode[] = [];

	if (param.type.type === 'reflection' && param.type.declaration.children) {
		result.push(...param.type.declaration.children.map((subParam: VariableReferenceNode) => (
				<FunctionParamDescEntry
					param={subParam}
					additionalTags={additionalTags}
					isCallback={isCallback}
					expandParams={expandParams}
					paramNamePrefix={`${paramName}.`}
				/>
			)
		));
	} else if (param.type.type === 'reference' && param.type.id && expandParams) {
		const refDesc = findSymbolByMember('id', param.type.id);
		if (refDesc) {
			const { symbol: ref } = refDesc;
			if (ref.kind === ReferenceNodeKind.Interface) {
				result.push(...ref.children.map((subParam: PropertyReferenceNode) => (
					<FunctionParamDescEntry
						param={subParam}
						additionalTags={additionalTags}
						isCallback={isCallback}
						expandParams={expandParams}
						paramNamePrefix={`${paramName}.`}
					/>
				)));
			}
		}
	}

	const typeDesc = buildType(param.type, param.kind !== ReferenceNodeKind.Parameter || param.flags.isOptional);

	result.unshift(
		<tr key={paramName}>
			<td className={classes.row}>{paramName}</td>
			<td className={classes.row}>{typeDesc}</td>
			{isCallback || (
				<>
					<td className={classes.row}>{
						param.flags.isOptional || defaultValue || isOptionalType(param.type)
							? ''
							: <Icon className={classes.checkMark} icon={faCheck}/>
					}</td>
					<td className={classes.row}>{defaultValue || <em>none</em>}</td>
				</>
			)}
			<td className={classes.row}>{desc ? parseMarkdown(desc) : <em>{result.length ? 'see below' : 'none'}</em>}</td>
		</tr>
	);

	return <React.Fragment key={`${paramNamePrefix}root`}>{result}</React.Fragment>;
};

FunctionParamDescEntry = withStyles(styles)(PureFunctionParamDescEntry);
export default FunctionParamDescEntry;
