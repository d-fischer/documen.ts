import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
	root: {
		padding: '1em',

		'& h2': {
			margin: 0
		}
	}
});

const PageContent: React.FC = ({ children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			{children}
		</div>
	);
};

export default PageContent;
