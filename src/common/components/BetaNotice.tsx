import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles(
	theme => ({
		root: {
			display: 'flow-root',
			borderLeft: `${theme.spacing.unit / 2}px solid ${theme.colors.badges.beta}`,
			backgroundColor: theme.colors.background.active,
			padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
			margin: `${theme.spacing.unit * 2}px 0`
		},
		title: {
			margin: `${theme.spacing.unit}px 0`
		}
	}),
	{ name: 'BetaNotice' }
);

const BetaNotice: React.FC = () => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<h3 className={classes.title}>Beta</h3>
			<p>This is an interface that may change without notice until it loses this beta annotation.</p>
		</div>
	);
};

export default BetaNotice;
