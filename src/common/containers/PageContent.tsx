import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
	root: {
		padding: theme.spacing.unit * 2,

		'& h2': {
			margin: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 2}px`
		},

		'& table': {
			borderCollapse: 'collapse'
		},

		'& th, & td': {
			border: `1px solid ${theme.colors.border}`,
			padding: theme.spacing.unit
		},

		'& li': {
			margin: `${theme.spacing.unit * 2}px 0`
		}
	}
}), { name: 'PageContent' });

const PageContent: React.FC = ({ children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			{children}
		</div>
	);
};

export default PageContent;
