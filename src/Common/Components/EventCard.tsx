import * as React from 'react';
import Card from '../Containers/Card';
import reference, {
	ParameterReferenceNode,
	PropertyReferenceNode,
	SignatureReferenceNode
} from '../Reference';
import { getTag, hasTag } from '../Tools/CodeBuilders';
import parseMarkdown from '../Tools/MarkdownParser';

import FunctionParamDesc from './FunctionParamDesc';
import { findByMember } from '../Tools/ArrayTools';
import { ReferenceNodeKind } from '../Reference/ReferenceNodeKind';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';
import DeprecationNotice from './DeprecationNotice';
import CardToolbar from './CardToolbar';

interface EventCardProps {
	name?: string;
	definition: PropertyReferenceNode;
}

const getParamDefinition = (param: ParameterReferenceNode) => {
	if (param.type.type === 'reflection' && param.type.declaration.signatures && param.type.declaration.signatures.length) {
		return param.type.declaration.signatures[0];
	} else if (param.type.type === 'reference' && param.type.id) {
		const ref = findByMember(reference.children, 'id', param.type.id);
		if (ref && ref.kind === ReferenceNodeKind.TypeAlias && ref.type.type === 'reflection' && ref.type.declaration.signatures && ref.type.declaration.signatures.length) {
			return ref.type.declaration.signatures[0];
		}
	}

	return undefined;
};

const getDefinedTags = (prop: PropertyReferenceNode) => {
	if (prop.type.type === 'reflection' && prop.type.declaration.signatures && prop.type.declaration.signatures.length) {
		const sig = prop.type.declaration.signatures[0];
		if (sig.parameters && sig.parameters.length) {
			const paramDefinition = sig.parameters[0];
			if (paramDefinition.type.type === 'reflection') {
				return prop.comment && prop.comment.tags;
			} else if (paramDefinition.type.type === 'reference' && paramDefinition.type.id) {
				const ref = findByMember(reference.children, 'id', paramDefinition.type.id);
				if (ref && ref.kind === ReferenceNodeKind.TypeAlias && ref.type.type === 'reflection') {
					return ref.comment && ref.comment.tags;
				}
			}
		}
	}

	return undefined;
};

const styles = createStyles(theme => ({
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
}));

const EventCard: React.FC<EventCardProps & WithSheet<typeof styles>> = ({ name, definition, classes }) => {
	let handlerDefinition: SignatureReferenceNode | undefined;
	let handlerParamDefinition: SignatureReferenceNode | undefined;
	if (definition.type.type === 'reflection' && definition.type.declaration.signatures && definition.type.declaration.signatures.length) {
		handlerDefinition = definition.type.declaration.signatures[0];
		if (handlerDefinition.parameters && handlerDefinition.parameters.length) {
			handlerParamDefinition = getParamDefinition(handlerDefinition.parameters[0]);
		}
	}
	return (
		<Card className={classes.root} id={`symbol__${name || definition.name}`} key={definition.id}>
			<CardToolbar className={classes.toolbar} name={name} definition={definition} />
			{handlerDefinition ? (
				<h3 className={classes.example}>
					{name || definition.name}({handlerDefinition.parameters && handlerDefinition.parameters.map((param, idx) => {
					let paramDesc: React.ReactNode = param.name === '__namedParameters' ? 'params' : param.name;
					const paramDef = getParamDefinition(param);
					if (paramDef) {
						paramDesc = (
							<>
								({paramDef.parameters && paramDef.parameters.map((handlerParam, handlerParamIndex) => (
									<React.Fragment key={handlerParam.name}>
										{handlerParamIndex !== 0 ? ', ' : ''}
										{handlerParam.name}
									</React.Fragment>
								))}) => {'{\n\t/* ... */\n}'}
							</>
						);
					}
					return (
						<React.Fragment key={param.name}>
							{idx !== 0 ? ', ' : ''}
							{paramDesc}
						</React.Fragment>
					);
				})})
				</h3>
			) : null
			}
			{hasTag(definition, 'deprecated') && <DeprecationNotice reason={parseMarkdown(getTag(definition, 'deprecated')!)}/>}
			{definition.comment && definition.comment.shortText ? parseMarkdown(definition.comment.shortText) : null}
			{definition.comment && definition.comment.text ? parseMarkdown(definition.comment.text) : null}
			{handlerParamDefinition ? <FunctionParamDesc signature={handlerParamDefinition} isCallback additionalTags={getDefinedTags(definition)}/> : null}
		</Card>
	);
};

export default withStyles(styles)(EventCard);
