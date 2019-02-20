import * as React from 'react';
import { ReferenceNode, SignatureReferenceNode } from '../Reference';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';
import CodeLink from './CodeLink';
import { HashLink } from 'react-router-hash-link';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import classNames = require('classnames');

interface CardToolbarProps {
	name?: string;
	definition: ReferenceNode;
	signature?: SignatureReferenceNode;
	className?: string;
}

const styles = createStyles(theme => ({
	root: {
		float: 'right'
	},
	button: {
		marginLeft: '.5em'
	},
	anchor: {
		color: theme.colors.accent.default,
		transition: 'color .3s ease-in-out',
		marginLeft: '1em',

		'&:hover': {
			color: theme.colors.accent.focus
		}
	}
}));

const CardToolbar: React.FC<CardToolbarProps & WithSheet<typeof styles>> = ({ name, definition, signature, className, classes }) => (
	<div className={classNames(classes.root, className)}>
		<CodeLink className={classes.button} symbol={definition}/>
		<HashLink className={classNames(classes.button, classes.anchor)} to={`#symbol__${name || (signature && signature.name) || definition.name}`} title="Direct link to this symbol">
			<Icon icon={faLink} size="lg"/>
		</HashLink>
	</div>
);

export default withStyles(styles)(CardToolbar);
