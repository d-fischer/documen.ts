import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles(
	theme => ({
		root: {
			padding: theme.spacing.unit * 2,
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
	}),
	{ name: 'PageHeader' }
);

const PageHeader: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
	const classes = useStyles();
	return <div className={classes.root}>{children}</div>;
};

export default PageHeader;
