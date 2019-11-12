import React from 'react';
import { makeStyles } from '@material-ui/styles';

interface NavMenuGroupProps {
	title: string;
}

const useStyles = makeStyles(theme => ({
	root: {
		display: 'block',
		color: theme.colors.text,

		'&:not(:first-child)': {
			marginTop: '1em'
		}
	},
	title: {
		margin: 0,
		padding: '.25em .5em .25em .75em',
		fontSize: '1.1em',
		lineHeight: '1em',
		height: '1em',
		fontWeight: 'bold',
		textTransform: 'uppercase'
	},
	items: {
		'& > a': {
			paddingLeft: '1.25em'
		}
	}
}), { name: 'NavMenuGroup' });

const NavMenuGroup: React.FC<NavMenuGroupProps> = ({ title, children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<h2 className={classes.title}>{title}</h2>
			<div className={classes.items}>
				{children}
			</div>
		</div>
	);
};

export default NavMenuGroup;
