import React, { useMemo } from 'react';
import Card from '../../Containers/Card';
import FunctionSignature from '../FunctionSignature';
import FunctionParamDesc from '../FunctionParamDesc';
import type { ConstructorReferenceNode, MethodReferenceNode, ReferenceType, SignatureReferenceNode } from '../../reference';
import { getTag, hasTag } from '../../Tools/CodeTools';

import DeprecationNotice from '../DeprecationNotice';
import CardToolbar from './CardToolbar';
import Badge from '../Badge';
import { makeStyles } from '@material-ui/styles';
import Type from '../CodeBuilders/Type';
import MarkdownParser from '../../Tools/MarkdownParser';
import { getAnchorName, typeIsAsync } from '../../Tools/NodeTools';

interface MethodCardProps {
	definition: ConstructorReferenceNode | MethodReferenceNode;
	sig: SignatureReferenceNode;
	isConstructor?: boolean;
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
	asyncBadge: {
		backgroundColor: theme.colors.badges.async
	},
	returnTypeWrapper: {
		fontWeight: 'bold',
		margin: '1em 0 0'
	},
	returnType: {
		fontWeight: 'normal',
		fontFamily: theme.fonts.code
	}
}), { name: 'MethodCard' });

const MethodCard: React.FC<MethodCardProps> = ({ definition, sig, isConstructor }) => {
	const classes = useStyles();

	const [isAsync, returnType] = useMemo<[boolean, ReferenceType]>(() => {
		if (typeIsAsync(sig.type)) {
			return [true, sig.type.typeArguments?.[0] ?? { type: 'intrinsic', name: 'any' }];
		}
		return [false, sig.type];
	}, [sig.type]);

	return (
		<Card className={classes.root} id={getAnchorName(definition, sig.name)} key={sig.id}>
			<CardToolbar className={classes.toolbar} definition={definition} signature={sig}/>
			<FunctionSignature signature={sig} isConstructor={isConstructor}/>
			{definition.flags.isStatic && <Badge>static</Badge>}
			{isAsync && (
				<Badge
					className={classes.asyncBadge}
					title="This method actually returns a Promise object, but the use of await is recommended for easier use. Please click on the badge for further information."
					href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/await"
				>
					async
				</Badge>
			)}
			{hasTag(sig, 'deprecated') && (
				<DeprecationNotice>
					<MarkdownParser source={getTag(sig, 'deprecated')!}/>
				</DeprecationNotice>
			)}
			{sig.comment?.shortText && <p>{sig.comment.shortText}</p>}
			{sig.comment?.text && <MarkdownParser source={sig.comment.text}/>}
			<FunctionParamDesc signature={sig}/>
			{!isConstructor && (
				<div className={classes.returnTypeWrapper}>
					Return type:{' '}
					<span className={classes.returnType}>
						<Type def={returnType}/>
					</span>
				</div>
			)}
		</Card>
	);
};

export default MethodCard;
