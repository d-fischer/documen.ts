import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router';
import type {
	CallSignatureReferenceNode,
	ConstructSignatureReferenceNode,
	ReferenceNode
} from '../../reference/index.js';
import { getAnchorName } from '../../tools/NodeTools.js';
import CodeLink from '../CodeLink.js';

interface CardToolbarProps {
	name?: string;
	definition: ReferenceNode;
	signature?: CallSignatureReferenceNode | ConstructSignatureReferenceNode;
	className?: string;
}

const useStyles = makeStyles(
	theme => ({
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
	}),
	{ name: 'CardToolbar' }
);

const CardToolbar: React.FC<CardToolbarProps> = ({ name, definition, signature, className }) => {
	const classes = useStyles();
	return (
		<div className={classNames(classes.root, className)}>
			<CodeLink className={classes.button} symbol={definition} signature={signature} />
			<Link
				className={classNames(classes.button, classes.anchor)}
				to={`#${getAnchorName(definition, name ?? signature?.name)}`}
				title="Direct link to this symbol"
			>
				<Icon icon={faLink} size="lg" />
			</Link>
		</div>
	);
};

export default CardToolbar;
