import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
	root: {
		padding: theme.spacing.unit * 2,

		'& h2': {
			margin: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 2}px`,

			'&:first-child': {
				marginTop: 0
			}
		}
	}
}), { name: 'PageContent' });

const PageContent: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			{children}
		</div>
	);
};

export default PageContent;
