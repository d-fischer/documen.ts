import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import type {
	CallSignatureReferenceNode,
	ConstructorReferenceNode, ConstructSignatureReferenceNode,
	FunctionReferenceNode,
	MethodReferenceNode,
	ParameterReferenceNode,
	PropertyReferenceNode,
	VariableReferenceNode
} from '../reference';
import { hasTag, isOptionalType } from '../tools/CodeTools';
import MarkdownParser from '../tools/MarkdownParser';
import { defaultNodeSort } from '../tools/NodeTools';
import { findSymbolByMember, getChildren } from '../tools/ReferenceTools';
import Type from './codeBuilders/Type';

interface FunctionParamDescEntryProps {
	param: ParameterReferenceNode | VariableReferenceNode | PropertyReferenceNode;
	functionDefinition: FunctionReferenceNode | MethodReferenceNode | ConstructorReferenceNode | PropertyReferenceNode;
	functionSignature?: CallSignatureReferenceNode | ConstructSignatureReferenceNode;
	isCallback?: boolean;
	expandParams?: boolean;
	paramNamePrefix?: string;
}

const useStyles = makeStyles(theme => ({
	row: {
		padding: theme.spacing.unit,
		textAlign: 'center',

		'& p': {
			margin: 0,

			'& + p': {
				marginTop: theme.spacing.unit
			}
		}
	},
	checkMark: {
		width: '1em'
	}
}), { name: 'FunctionParamDescEntry' });

const FunctionParamDescEntry: React.FC<FunctionParamDescEntryProps> = ({ param, functionDefinition, functionSignature, isCallback, expandParams, paramNamePrefix = '' }) => {
	const classes = useStyles();
	const shortDesc = param.comment?.shortText;
	let desc = param.comment?.text;

	if (!desc) {
		const correctTag = (functionSignature?.comment ?? functionDefinition.comment)?.tags?.find(tag => tag.tag === 'param' && tag.param === param.name);
		if (correctTag) {
			desc = correctTag.text;
		}
	}

	const isNamedParams = /^__\d+$/.test(param.name);
	expandParams ||= isNamedParams;
	const paramName = `${paramNamePrefix}${isNamedParams ? 'params' : param.name}`;
	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	const defaultValue = param.kind === 'property' ? undefined : (param.defaultValue || undefined);

	const result: React.ReactNode[] = [];

	if (param.type.type === 'reflection') {
		result.push(...getChildren(param.type.declaration).filter((c): c is VariableReferenceNode => c.kind === 'variable').sort(defaultNodeSort).map(subParam => (
			<FunctionParamDescEntry
				key={`${paramName}.${subParam.name}`}
				param={subParam}
				functionDefinition={functionDefinition}
				functionSignature={functionSignature}
				isCallback={isCallback}
				expandParams={expandParams}
				paramNamePrefix={`${paramName}.`}
			/>
		)));
	} else if (param.type.type === 'reference' && param.type.id && expandParams) {
		const refDesc = findSymbolByMember('id', param.type.id);
		if (refDesc) {
			const { symbol: ref } = refDesc;
			if (ref.kind === 'interface' && !hasTag(ref, 'neverExpand')) {
				result.push(...getChildren(ref).filter((c): c is PropertyReferenceNode => c.kind === 'property').sort(defaultNodeSort).map(subParam => (
					<FunctionParamDescEntry
						key={`${paramName}.${subParam.name}`}
						param={subParam}
						functionDefinition={functionDefinition}
						functionSignature={functionSignature}
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
				<Type def={param.type} ignoreUndefined={param.kind !== 'parameter' || param.flags?.isOptional}/>
			</td>
			{isCallback ? null : (
				<>
					<td className={classes.row}>{
						param.flags?.isOptional || defaultValue || isOptionalType(param.type)
							? ''
							: <Icon className={classes.checkMark} icon={faCheck}/>
					}</td>
					<td className={classes.row}>{defaultValue ?? <em>none</em>}</td>
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
