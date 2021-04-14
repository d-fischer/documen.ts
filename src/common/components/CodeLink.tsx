import React, { useContext } from 'react';
import type { CallSignatureReferenceNode, ConstructSignatureReferenceNode, ReferenceNode } from '../reference';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import { ConfigContext } from '../config';

import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';

interface CodeLinkProps {
	symbol: ReferenceNode;
	signature?: CallSignatureReferenceNode | ConstructSignatureReferenceNode;
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

const CodeLink: React.FC<CodeLinkProps> = ({ signature, symbol, className }) => {
	const classes = useStyles();
	const config = useContext(ConfigContext);

	if (!(config.repoUser && config.repoName)) {
		return null;
	}

	const { location } = signature ?? symbol;

	if (!location) {
		return null;
	}

	const { fileName, line } = location;
	return <a
		className={classNames(classes.root, className)}
		href={`https://github.com/${[
			config.repoUser,
			config.repoName,
			'blob',
			config.repoBranch,
			fileName
		].join('/')}#L${line}`}
		target="_blank"
		rel="noopener noreferrer"
		title="Go to the code"
	>
		<Icon icon={faCode} size="lg"/>
	</a>;
};

export default CodeLink;
