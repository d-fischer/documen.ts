import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(
	theme => ({
		root: {
			display: 'flow-root',
			borderLeft: `${theme.spacing.unit / 2}px solid ${theme.colors.badges.beta}`,
			backgroundColor: theme.colors.background.active,
			padding: theme.spacing.unit * 2,
			paddingBottom: theme.spacing.unit,
			margin: '1em 0'
		}
	}),
	{ name: 'BetaNotice' }
);

const BetaNotice: React.FC = () => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<h3>Beta</h3>
			<p>This is an interface that may change without notice until it loses this beta annotation.</p>
		</div>
	);
};

export default BetaNotice;
