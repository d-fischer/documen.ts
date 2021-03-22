import { makeStyles } from '@material-ui/styles';
import React, { useContext, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { ConfigContext } from '../config';
import { getPackageList } from '../tools/ReferenceTools';
import VersionMenu from './VersionMenu';

const useStyles = makeStyles(theme => ({
	root: {
		borderBottom: `1px solid ${theme.colors.border}`,
		display: 'flex'
	},
	entry: {
		borderRight: `1px solid ${theme.colors.border}`,
		padding: theme.spacing.unit,
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
	},
	spacer: {
		flex: 1
	}
}), { name: 'MonoMenu' });

const MonoMenu: React.FC = () => {
	const classes = useStyles();
	const config = useContext(ConfigContext);
	const packageNames = useMemo(() => getPackageList().map(pkg => pkg.packageName).filter(pkg => !config.ignoredPackages?.includes(pkg)), []);
	return (
		<div className={classes.root}>
			{packageNames.map(pkg => <NavLink to={`/${pkg}/`} className={classes.entry} activeClassName={classes.entryActive} key={pkg}>{pkg}</NavLink>)}
			{config.versionBranchPrefix ? (
				<>
					<div className={classes.spacer}/>
					<VersionMenu/>
				</>
			) : null}
		</div>
	);
};

export default MonoMenu;
