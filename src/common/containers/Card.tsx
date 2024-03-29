import { makeStyles } from '@mui/styles';

import classNames from 'classnames';
import React from 'react';

interface CardProps {
	className?: string;
	id?: string;
}

const useStyles = makeStyles(
	theme => ({
		root: {
			margin: `${theme.spacing.unit * 2}px 0`,
			padding: theme.spacing.unit * 2,
			borderLeft: `${theme.spacing.unit / 2}px solid ${theme.colors.border}`,

			'& h3, & h4': {
				margin: 0
			},

			'& > :last-child': {
				marginBottom: 0
			},

			'&:target': {
				backgroundColor: theme.colors.background.active
			}
		}
	}),
	{ name: 'Card' }
);

const Card: React.FC<React.PropsWithChildren<CardProps>> = ({ className, id, children }) => {
	const classes = useStyles();
	return (
		<div id={id} className={classNames(classes.root, className)}>
			{children}
		</div>
	);
};

export default Card;
