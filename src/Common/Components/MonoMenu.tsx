import React from 'react';
import { getPackageList } from '../Tools/ReferenceTools';
import { makeStyles } from '@material-ui/styles';
import { NavLink } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
	root: {
		borderBottom: `1px solid ${theme.colors.border}`,
		display: 'flex'
	},
	entry: {
		borderRight: `1px solid ${theme.colors.border}`,
		padding: 8,
		cursor: 'pointer',
		textDecoration: 'none',
		color: theme.colors.text,
		transition: 'background-color .3s ease-in-out, border-color .3s ease-in-out',
		borderBottom: '3px solid transparent',

		'&:hover': {
			backgroundColor: theme.colors.background.hover
		}
	},
	entryActive: {
		borderBottomColor: theme.colors.accent.default,
		backgroundColor: theme.colors.background.active,

		'&:hover': {
			borderBottomColor: theme.colors.accent.focus
		}
	}
}), { name: 'MonoMenu' });

const MonoMenu: React.FC = () => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			{getPackageList().map(pkg => <NavLink to={`/${pkg.name}/`} className={classes.entry} activeClassName={classes.entryActive} key={pkg.name}>{pkg.name}</NavLink>)}
		</div>
	);
};

export default MonoMenu;
