import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { HashLink } from 'react-router-hash-link';
import { ReferenceNode } from '../../reference';
import { ReferenceNodeKind } from '../../reference/ReferenceNodeKind';
import { hasTag } from '../../Tools/CodeTools';
import { getAnchorName, typeIsAsync } from '../../Tools/NodeTools';
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
			{hasTag(node, 'deprecated') || (node.kind === ReferenceNodeKind.Method && node.signatures?.some(sig => hasTag(sig, 'deprecated'))) ? (
				<Badge small className={classes.deprecatedBadge} title="deprecated">d</Badge>
			) : null}
			{node.flags.isStatic ? <Badge small title='static'>s</Badge> : null}
			{node.kind === ReferenceNodeKind.Method && node.signatures?.some(sig => typeIsAsync(sig.type)) ? (
				<Badge small className={classes.asyncBadge} title="async">a</Badge>
			) : null}
		</li>
	);
};

export default OverviewTableEntry;
