import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import React, { useContext, useMemo } from 'react';
import { NavLink, useLocation, useResolvedPath } from 'react-router-dom';
import { ConfigContext } from '../config';
import { getPackageList } from '../tools/ReferenceTools';
import VersionMenu from './VersionMenu';

const useStyles = makeStyles(theme => ({
	root: {
		borderBottom: `1px solid ${theme.colors.border}`,
		display: 'flex'
	},
	entry: {
		margin: `0 ${theme.spacing.unit}px`,
		padding: theme.spacing.unit,
		cursor: 'pointer',
		textDecoration: 'none',
		userSelect: 'none',
		color: theme.colors.text,
		transition: 'background-color .3s ease-in-out, border-color .3s ease-in-out',
		borderBottom: '3px solid transparent',
		lineHeight: '1.3em',

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
	title: {
		fontWeight: 'bold',
		marginLeft: 0,
	},
	referenceWrapper: {
		position: 'relative',
		margin: `0 ${theme.spacing.unit}px`,

		'& > $entry': {
			margin: 0
		},

		'&:hover $referenceMenu': {
			display: 'block'
		}
	},
	referenceMenu: {
		display: 'none',
		position: 'absolute',
		top: '100%',
		left: 0,
		border: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.background.default,
		zIndex: 4
	},
	referenceMenuEntry: {
		display: 'block',
		borderRight: '0 none',
		borderBottom: '0 none',
		margin: 0,
		borderLeft: '3px solid transparent',

		'&:first-child': {
			borderTop: '0 none'
		}
	},
	referenceMenuEntryActive: {
		borderLeftColor: theme.colors.accent.default,
		backgroundColor: theme.colors.background.active,

		'&:hover': {
			borderLeftColor: theme.colors.accent.focus
		}
	},
	spacer: {
		flex: 1
	}
}), { name: 'MainMenu' });

const MainMenu: React.FC = () => {
	const classes = useStyles();
	const config = useContext(ConfigContext);
	const packageNames = useMemo(() => getPackageList().map(pkg => pkg.packageName).filter(pkg => !config.ignoredPackages?.includes(pkg)), []);

	// check if reference is active, stolen from NavLink but we don't want it to be a link
	const location = useLocation();
	const path = useResolvedPath('/reference');
	const locationPathname = location.pathname;
	const toPathname = path.pathname;
	const referenceActive = locationPathname.startsWith(toPathname);

	return (
		<div className={classes.root}>
			<NavLink end to="/" className={classNames(classes.entry, classes.title)} activeClassName={classes.entryActive}>{config.title ?? 'Docs'}</NavLink>
			{config.categories?.map(cat => (
				<NavLink key={cat.name} to={`/docs/${cat.name}/`} className={classes.entry} activeClassName={classes.entryActive}>{cat.title ?? cat.name}</NavLink>
			))}
			<div className={classes.referenceWrapper}>
				<div className={classNames(classes.entry, { [classes.entryActive]: referenceActive })}>Reference</div>
				<div className={classes.referenceMenu}>
					{packageNames.map(pkg => <NavLink to={`/reference/${pkg}/`} className={classNames(classes.entry, classes.referenceMenuEntry)} activeClassName={classes.referenceMenuEntryActive} key={pkg}>{pkg}</NavLink>)}
				</div>
			</div>
			{config.versionBranchPrefix ? (
				<>
					<div className={classes.spacer}/>
					<VersionMenu/>
				</>
			) : null}
		</div>
	);
};

export default MainMenu;
