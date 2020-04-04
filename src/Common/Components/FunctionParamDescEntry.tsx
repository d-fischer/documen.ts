import { ParameterReferenceNode, PropertyReferenceNode, ReferenceCommentTag, VariableReferenceNode } from '../reference';
import React from 'react';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import { isOptionalType } from '../Tools/CodeTools';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import MarkdownParser from '../Tools/MarkdownParser';
import { findSymbolByMember } from '../Tools/ReferenceTools';
import { makeStyles } from '@material-ui/styles';
import Type from './CodeBuilders/Type';

interface FunctionParamDescEntryProps {
	param: ParameterReferenceNode | VariableReferenceNode | PropertyReferenceNode;
	additionalTags?: ReferenceCommentTag[];
	isCallback?: boolean;
	expandParams?: boolean;
	paramNamePrefix?: string;
}

const useStyles = makeStyles({
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
}, { name: 'FunctionParamDescEntry' });

const FunctionParamDescEntry: React.FC<FunctionParamDescEntryProps> = ({ param, additionalTags, isCallback, expandParams, paramNamePrefix = '' }) => {
	const classes = useStyles();
	const shortDesc = param.comment?.shortText;
	let desc = param.comment?.text;

	if (!desc && additionalTags) {
		const correctTag = additionalTags.find(tag => tag.tag === 'param' && tag.param === param.name);
		if (correctTag) {
			desc = correctTag.text;
		}
	}

	const paramName = `${paramNamePrefix}${param.name === '__namedParameters' ? 'params' : param.name}`;
	const defaultValue = param.kind === ReferenceNodeKind.Property ? undefined : param.defaultValue;

	const result: React.ReactNode[] = [];

	if (param.type.type === 'reflection' && param.type.declaration.children) {
		result.push(...param.type.declaration.children.map((subParam: VariableReferenceNode) => (
				<FunctionParamDescEntry
					key={`${paramName}.${subParam.name}`}
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
						key={`${paramName}.${subParam.name}`}
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

	result.unshift(
		<tr key={paramName}>
			<td className={classes.row}>{paramName}</td>
			<td className={classes.row}>
				<Type def={param.type} ignoreUndefined={param.kind !== ReferenceNodeKind.Parameter || param.flags.isOptional}/>
			</td>
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
			<td className={classes.row}>
				{
					(shortDesc || desc) ? (
						<>
							{shortDesc ? <MarkdownParser source={shortDesc}/> : null}
							{desc ? <MarkdownParser source={desc}/> : null}
						</>
					) : <em>{result.length ? 'see below' : 'none'}</em>
				}
			</td>
		</tr>
	);

	return <React.Fragment key={`${paramNamePrefix}root`}>{result}</React.Fragment>;
};

export default FunctionParamDescEntry;
