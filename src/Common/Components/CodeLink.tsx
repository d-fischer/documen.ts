import React, { useContext } from 'react';
import type { ReferenceNode } from '../reference';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import { ConfigContext, projectBase, sourceBase } from '../config';
import path from 'path';

import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';

interface CodeLinkProps {
	symbol: ReferenceNode;
	className?: string;
}

const useStyles = makeStyles(theme => ({
	root: {
		color: theme.colors.accent.default,
		transition: 'color .3s ease-in-out',
		marginLeft: '1em',

		'&:hover': {
			color: theme.colors.accent.focus
		}
	}
}), { name: 'CodeLink' });

const CodeLink: React.FC<CodeLinkProps> = ({ symbol, className }) => {
	const classes = useStyles();
	const config = useContext(ConfigContext);

	if (!(config.repoUser && config.repoName && symbol.location)) {
		return null;
	}

	const { location: { fileName, line } } = symbol;
	return <a
		className={classNames(classes.root, className)}
		href={`https://github.com/${path.join(
			config.repoUser,
			config.repoName,
			'blob',
			config.repoBranch,
			path.relative(projectBase, path.join(sourceBase, fileName))
		)}#L${line}`}
		target="_blank"
		rel="noopener noreferrer"
		title="Go to the code"
	>
		<Icon icon={faCode} size="lg"/>
	</a>;
};

export default CodeLink;
