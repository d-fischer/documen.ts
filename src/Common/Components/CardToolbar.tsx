import React from 'react';
import { ReferenceNode, SignatureReferenceNode } from '../reference';
import CodeLink from './CodeLink';
import { HashLink } from 'react-router-hash-link';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';

interface CardToolbarProps {
	name?: string;
	definition: ReferenceNode;
	signature?: SignatureReferenceNode;
	className?: string;
}

const useStyles = makeStyles(theme => ({
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
}), { name: 'CardToolbar' });

const CardToolbar: React.FC<CardToolbarProps> = ({ name, definition, signature, className }) => {
	const classes = useStyles();
	return (
		<div className={classNames(classes.root, className)}>
			<CodeLink className={classes.button} symbol={definition}/>
			<HashLink className={classNames(classes.button, classes.anchor)} to={`#symbol__${name || (signature && signature.name) || definition.name}`} title="Direct link to this symbol">
				<Icon icon={faLink} size="lg"/>
			</HashLink>
		</div>
	);
};

export default CardToolbar;
