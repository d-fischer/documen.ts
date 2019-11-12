import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
	root: {
		borderBottom: `1px solid ${theme.colors.border}`,
		padding: '1em',
		position: 'relative',
		backgroundColor: theme.colors.background.active,
		color: theme.colors.text,

		'& h1': {
			fontWeight: 'normal',
			margin: 0,
			fontSize: '1.5em',
			display: 'inline'
		},

		'& p': {
			margin: 0
		}
	}
}), { name: 'PageHeader' });

const PageHeader: React.FC = ({ children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			{children}
		</div>
	);
};

export default PageHeader;
