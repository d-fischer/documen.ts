import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
	root: {
		borderLeft: `${theme.spacing.unit / 2}px solid ${theme.colors.warning}`,
		padding: theme.spacing.unit * 2,
		margin: '1em 0'
	},
}), { name: 'DeprecationNotice' });

const DeprecationNotice: React.FC = ({ children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<h3>Deprecated</h3>
			{children}
		</div>
	);
};

export default DeprecationNotice;
