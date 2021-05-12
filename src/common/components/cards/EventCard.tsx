import { makeStyles } from '@material-ui/styles';
import React from 'react';
import Card from '../../containers/Card';
import type { ParameterReferenceNode, PropertyReferenceNode, CallSignatureReferenceNode } from '../../reference';
import { getTag, hasTag } from '../../tools/CodeTools';
import MarkdownParser from '../../tools/markdown/MarkdownParser';
import { getAnchorName } from '../../tools/NodeTools';
import { findSymbolByMember} from '../../tools/ReferenceTools';
import DeprecationNotice from '../DeprecationNotice';

import FunctionParamDesc from '../FunctionParamDesc';
import CardToolbar from './CardToolbar';

interface EventCardProps {
	name?: string;
	definition: PropertyReferenceNode;
}

function getParamDefinition(param: ParameterReferenceNode) {
	if (param.type.type === 'reflection' && param.type.declaration.signatures && param.type.declaration.signatures.length) {
		return param.type.declaration.signatures[0];
	} else if (param.type.type === 'reference' && param.type.id) {
		const ref = findSymbolByMember('id', param.type.id);
		if (ref) {
			const { symbol } = ref;
			if (symbol.kind === 'typeAlias' && symbol.type.type === 'reflection' && symbol.type.declaration.signatures && symbol.type.declaration.signatures.length) {
				return symbol.type.declaration.signatures[0];
			}
		}
	}

	return undefined;
}

const useStyles = makeStyles(theme => ({
	root: {},
	toolbar: {
		opacity: 0,
		transition: 'opacity .5s ease-in-out',

		'$root:hover &': {
			opacity: 1
		}
	},
	example: {
		fontFamily: theme.fonts.code
	}
}), { name: 'EventCard' });

const EventCard: React.FC<EventCardProps> = ({ name, definition }) => {
	const classes = useStyles();
	let handlerDefinition: CallSignatureReferenceNode | undefined = undefined;
	let handlerParamDefinition: CallSignatureReferenceNode | undefined = undefined;
	if (definition.type.type === 'reflection' && definition.type.declaration.signatures && definition.type.declaration.signatures.length) {
		handlerDefinition = definition.type.declaration.signatures[0];
		if (handlerDefinition.parameters.length) {
			handlerParamDefinition = getParamDefinition(handlerDefinition.parameters[0]);
		}
	} else if (definition.type.type === 'reference' && definition.type.typeArguments?.length) {
		const binderType = definition.type.typeArguments[0];
		if (binderType.type === 'tuple') {
			handlerParamDefinition = {
				id: -1,
				name: '__call',
				kind: 'callSignature',
				parameters: binderType.elements.map((type, idx) => ({
					id: -1,
					name: type.type === 'named-tuple-member' ? type.name : `_arg${idx}`,
					kind: 'parameter',
					type: type.type === 'named-tuple-member' ? type.element : type,
					location: definition.location
				})),
				type: {
					type: 'intrinsic',
					name: 'void'
				},
				location: definition.location
			};
		}
	}
	return (
		<Card className={classes.root} id={getAnchorName(definition, name)} key={definition.id}>
			<CardToolbar className={classes.toolbar} name={name} definition={definition}/>
			<h3 className={classes.example}>
				{name ?? definition.name}(
				{handlerParamDefinition ? (
					<>
						({handlerParamDefinition.parameters.map((handlerParam, handlerParamIndex) => (
						<React.Fragment key={handlerParam.name}>
							{handlerParamIndex === 0 ? '' : ', '}
							{handlerParam.name}
						</React.Fragment>
					))}) =&gt; {'{\n\t/* ... */\n}'}
					</>
				) : null}
				)
			</h3>
			{hasTag(definition, 'deprecated') && (
				<DeprecationNotice>
					<MarkdownParser source={getTag(definition, 'deprecated')!}/>
				</DeprecationNotice>
			)}
			{definition.comment?.shortText ? <MarkdownParser source={definition.comment.shortText}/> : null}
			{definition.comment?.text ? <MarkdownParser source={definition.comment.text}/> : null}
			{handlerParamDefinition ? <FunctionParamDesc functionDefinition={definition} signature={handlerParamDefinition} isCallback/> : null}
		</Card>
	);
};

export default EventCard;
