import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';

interface NavMenuItemProps {
	path: string;
	exact?: boolean;
	title?: string;
}

const styles = createStyles(theme => ({
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
}));

const NavMenuItem: React.FC<NavMenuItemProps & WithSheet<typeof styles>> = ({ path, exact, title, children, classes }) => (
	<NavLink to={path} exact={exact} className={classes.root} activeClassName={classes.rootActive} title={title}>
		{children}
	</NavLink>
);

export default withStyles(styles)(NavMenuItem);
