import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles(
	theme => ({
		root: {
			display: 'flow-root',
			borderLeft: `${theme.spacing.unit / 2}px solid ${theme.colors.badges.deprecated}`,
			backgroundColor: theme.colors.background.active,
			padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
			margin: `${theme.spacing.unit * 2}px 0`
		},
		title: {
			margin: `${theme.spacing.unit}px 0`
		}
	}),
	{ name: 'DeprecationNotice' }
);

const DeprecationNotice: React.FC = ({ children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<h3 className={classes.title}>Deprecated</h3>
			{children}
		</div>
	);
};

export default DeprecationNotice;
