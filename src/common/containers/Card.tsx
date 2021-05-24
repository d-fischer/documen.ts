import React from 'react';

import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';

interface CardProps {
	className?: string;
	id?: string;
}

const useStyles = makeStyles(theme => ({
	root: {
		margin: `${theme.spacing.unit * 2}px 0`,
		padding: theme.spacing.unit * 2,
		borderLeft: `${theme.spacing.unit / 2}px solid ${theme.colors.border}`,

		'& h3, & h4': {
			margin: 0
		},

		'& > :last-child': {
			marginBottom: 0
		}
	}
}), { name: 'Card' });

const Card: React.FC<CardProps> = ({ className, id, children }) => {
	const classes = useStyles();
	return (
		<div id={id} className={classNames(classes.root, className)}>
			{children}
		</div>
	);
};

export default Card;
