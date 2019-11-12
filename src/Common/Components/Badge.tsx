import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'inline-block',
		color: theme.colors.background.default,
		backgroundColor: theme.colors.text,
		marginLeft: '1em',
		padding: '2px 5px',
		borderRadius: 5
	}
}), { name: 'Badge' });

const Badge: React.FC = ({ children }) => {
	const classes = useStyles();
	return (
		<span className={classes.root}>{children}</span>
	);
};

export default Badge;
