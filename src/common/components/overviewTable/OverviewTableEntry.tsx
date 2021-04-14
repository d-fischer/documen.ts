import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { HashLink } from 'react-router-hash-link';
import type { ReferenceNode } from '../../reference';
import { hasTag } from '../../tools/CodeTools';
import { getAnchorName, typeIsAsync } from '../../tools/NodeTools';
import Badge from '../Badge';

const useStyles = makeStyles(theme => ({
	root: {
		listStyleType: 'none'
	},
	link: {
		color: theme.colors.link,
		textDecoration: 'none',
		fontSize: 12
	},
	asyncBadge: {
		backgroundColor: theme.colors.badges.async
	},
	deprecatedBadge: {
		backgroundColor: theme.colors.badges.deprecated
	}
}), { name: 'OverviewTableEntry' });

interface OverviewTableEntryProps {
	node: ReferenceNode;
}

const OverviewTableEntry: React.FC<OverviewTableEntryProps> = ({ node }) => {
	const classes = useStyles();

	return (
		<li className={classes.root}>
			<HashLink className={classes.link} to={`#${getAnchorName(node)}`}>{node.name}</HashLink>
			{hasTag(node, 'deprecated') || (node.kind === 'method' && node.signatures?.some(sig => hasTag(sig, 'deprecated'))) || node.kind === 'accessor' && node.getSignature && hasTag(node.getSignature, 'deprecated') ? (
				<Badge small className={classes.deprecatedBadge} title="deprecated">d</Badge>
			) : null}
			{node.flags?.isStatic ? <Badge small title='static'>s</Badge> : null}
			{node.kind === 'method' && node.signatures?.some(sig => typeIsAsync(sig.type)) ? (
				<Badge small className={classes.asyncBadge} title="async">a</Badge>
			) : null}
		</li>
	);
};

export default OverviewTableEntry;
