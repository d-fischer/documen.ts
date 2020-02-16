import React from 'react';
import { NavLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';

interface NavMenuItemProps {
	path: string;
	exact?: boolean;
	external?: boolean;
	title?: string;
}

const useStyles = makeStyles(theme => ({
	root: {
		height: '1em',
		padding: '.5em',
		lineHeight: '1em',
		display: 'block',
		textDecoration: 'none',
		color: theme.colors.text,
		transition: '.3s background-color ease-in-out, .3s border-left-color ease-in-out',
		borderLeft: '.25em solid transparent',
		overflow: 'hidden',
		textOverflow: 'ellipsis',

		'&:hover': {
			backgroundColor: theme.colors.background.hover
		}
	},
	rootActive: {
		borderColor: theme.colors.accent.default,
		backgroundColor: theme.colors.background.active,

		'&:hover': {
			borderLeftColor: theme.colors.accent.focus
		}
	}
}), { name: 'NavMenuItem' });

const NavMenuItem: React.FC<NavMenuItemProps> = ({ path, exact, external, title, children }) => {
	const classes = useStyles();
	if (external) {
		return (
			<a href={path} target="_blank" rel="noopener noreferrer" className={classes.root} title={title}>
				{children}
			</a>
		);
	}
	return (
		<NavLink to={path} exact={exact} className={classes.root} activeClassName={classes.rootActive} title={title}>
			{children}
		</NavLink>
	);
};

export default NavMenuItem;
