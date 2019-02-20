import * as React from 'react';
import { ReferenceNode } from '../Reference';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import config from '../Config';

import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';
import classNames = require('classnames');

interface CodeLinkProps {
	symbol: ReferenceNode;
	className?: string;
}

const styles = createStyles(theme => ({
	root: {
		color: theme.colors.accent.default,
		transition: 'color .3s ease-in-out',
		marginLeft: '1em',

		'&:hover': {
			color: theme.colors.accent.focus
		}
	}
}));

const CodeLink: React.FC<CodeLinkProps & WithSheet<typeof styles>> = ({ symbol, className, classes }) => config.repoUser && config.repoName && symbol.sources && symbol.sources.length ? (
	<a
		className={classNames(classes.root, className)}
		href={`https://github.com/${config.repoUser}/${config.repoName}/blob/master/src/${symbol.sources[0].fileName}#L${symbol.sources[0].line}`}
		title="Go to the code"
	>
		<Icon icon={faCode} size="lg"/>
	</a>
) : null;

export default withStyles(styles)(CodeLink);
