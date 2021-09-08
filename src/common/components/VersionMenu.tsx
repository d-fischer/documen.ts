import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ConfigContext, rootUrl } from '../config';
import { useAsyncEffect } from '../tools/FunctionTools';

const useStyles = makeStyles(theme => ({
	entry: {
		borderRight: `1px solid ${theme.colors.border}`,
		padding: theme.spacing.unit,
		cursor: 'pointer',
		userSelect: 'none',
		textDecoration: 'none',
		color: theme.colors.text,
		transition: 'background-color .3s ease-in-out, border-color .3s ease-in-out',
		borderBottom: '3px solid transparent',
		lineHeight: '1.3em',

		'&:hover': {
			backgroundColor: theme.colors.background.hover
		}
	},
	wrapper: {
		position: 'relative'
	},
	warning: {
		color: theme.colors.warning,
	},
	activator: {
		borderRight: '0 none',
		borderLeft: `1px solid ${theme.colors.border}`
	},
	menu: {
		position: 'absolute',
		right: 0,
		top: '100%',
		zIndex: 4,
		backgroundColor: theme.colors.background.default,
		border: `1px solid ${theme.colors.border}`
	},
	menuEntry: {
		display: 'block',
		borderRight: '0 none',
		borderTop: `1px solid ${theme.colors.border}`,

		'&:first-child': {
			borderTop: '0 none'
		}
	}
}), { name: 'VersionMenu' });

const VersionMenu: React.FC = __DOCTS_COMPONENT_MODE === 'static' ? (
	() => <div data-dynamic-component="VersionMenu"/>
) : (
	() => {
		const classes = useStyles();
		const config = useContext(ConfigContext);
		const currentVersion = useMemo(() => config.version, [config]);
		const [manifest, setManifest] = useState(config.__devManifest);
		const [manifestLoading, setManifestLoading] = useState(false);
		useAsyncEffect(async () => {
			if (!manifest && config.versionBranchPrefix) {
				setManifestLoading(true);
				setManifest(await fetch(`${rootUrl}/manifest.json`).then(async r => r.json()));
				setManifestLoading(false);
			}
		}, [manifest, manifestLoading, config]);
		const [menuOpen, setMenuOpen] = useState(false);
		const toggleMenuOpen = useCallback(() => setMenuOpen(b => !b), []);
		return (
			manifest?.versions?.filter(v => v !== config.defaultVersion).length ? (
				<div className={classes.wrapper}>
					<div className={classNames(classes.entry, classes.activator)} onClick={toggleMenuOpen}>
						{currentVersion}
					</div>
					{menuOpen && (
						<div className={classes.menu}>
							<a className={classNames(classes.entry, classes.menuEntry)} key={config.defaultVersion}
							   href={`${manifest.rootUrl}/`}>{config.defaultVersion}</a>
							{manifest.versions.filter(v => v !== config.defaultVersion).map((version: string) => (
								<a className={classNames(classes.entry, classes.menuEntry)} key={version}
								   href={`${manifest.rootUrl}/${config.versionFolder!}/${version}/`}>{version}</a>
							))}
						</div>
					)}
				</div>
			) : null
		);
	}
);

export default VersionMenu;
