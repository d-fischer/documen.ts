import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { HashLink } from 'react-router-hash-link';
import { ReferenceNode } from '../../reference';
import { ReferenceNodeKind } from '../../reference/ReferenceNodeKind';
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
			{node.flags.isStatic ? <Badge small title='static'>s</Badge> : null}
			{node.kind === ReferenceNodeKind.Method && node.signatures?.some(sig => typeIsAsync(sig.type)) ? (
				<Badge small title="async">a</Badge>
			) : null}
		</li>
	);
};

export default OverviewTableEntry;
