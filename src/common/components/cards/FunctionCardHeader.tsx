import { makeStyles } from '@mui/styles';
import React from 'react';
import type {
	CallSignatureReferenceNode,
	ClassReferenceNode,
	ConstructorReferenceNode,
	ConstructSignatureReferenceNode,
	FunctionReferenceNode,
	InterfaceReferenceNode,
	MethodReferenceNode
} from '../../reference/index.js';
import { getTag, hasTag } from '../../tools/CodeTools.js';
import MarkdownParser from '../../tools/markdown/MarkdownParser.js';
import { useAsyncType } from '../../tools/NodeTools.js';
import Badge from '../Badge.js';
import BetaNotice from '../BetaNotice.js';
import DeprecationNotice from '../DeprecationNotice.js';
import FunctionSignature from '../FunctionSignature.js';

interface FunctionCardHeaderProps {
	parent?: ClassReferenceNode | InterfaceReferenceNode;
	definition: ConstructorReferenceNode | MethodReferenceNode | FunctionReferenceNode;
	sig: CallSignatureReferenceNode | ConstructSignatureReferenceNode;
}

const useStyles = makeStyles(
	theme => ({
		root: {},
		asyncBadge: {
			backgroundColor: theme.colors.badges.async
		}
	}),
	{ name: 'FunctionCardHeader' }
);

export const FunctionCardHeader: React.FunctionComponent<FunctionCardHeaderProps> = ({ sig, definition, parent }) => {
	const classes = useStyles();
	const { isAsync } = useAsyncType(sig);
	return (
		<>
			<FunctionSignature signature={sig} parent={parent} />
			{definition.flags?.isStatic && <Badge>static</Badge>}
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
					<MarkdownParser source={getTag(sig, 'deprecated')!} />
				</DeprecationNotice>
			)}
			{hasTag(sig, 'beta') && <BetaNotice />}
		</>
	);
};
