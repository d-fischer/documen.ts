import * as React from 'react';
// eslint-disable-next-line no-duplicate-imports
import { useMemo } from 'react';
import { hot } from 'react-hot-loader';

import NavMenu from '../Components/NavMenu';

import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import config from '../config';
import NavMenuGroup from '../Components/NavMenuGroup';
import NavMenuItem from '../Components/NavMenuItem';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';
import * as Color from 'color';
import PageSwitch from './PageSwitch';
import { RouteComponentProps } from 'react-router';
import { getPackageRoot } from '../Tools/ReferenceTools';
import { filterByMember } from '../Tools/ArrayTools';
import { getPackagePath } from '../Tools/StringTools';

const styles = createStyles(theme => ({
	root: {
		display: 'flex',
		flexDirection: 'row',
		width: '100%',
		minHeight: '100%'
	},
	nav: {
		width: 250
	},
	main: {
		flex: 1,

		'& a': {
			color: Color(theme.colors.text).darken(0.2).rgb().string(),
			fontWeight: 'bold',
			textDecoration: 'none'
		}
	}
}));

interface PackageContainerRouteParams {
	packageName?: string;
}

export const PackageContainer: React.FC<RouteComponentProps<PackageContainerRouteParams> & WithSheet<typeof styles>> = ({ match, classes }) => {
	const { packageName } = match.params;
	const pre = getPackagePath(packageName);

	const root = useMemo(() => getPackageRoot(packageName), [packageName]);

	if (!root) {
		return null;
	}

	const classNodes = useMemo(() => filterByMember(root.children, 'kind', ReferenceNodeKind.Class), [root]);
	const interfaceNodes = useMemo(() => filterByMember(root.children, 'kind', ReferenceNodeKind.Interface), [root]);
	const enumNodes = useMemo(() => filterByMember(root.children, 'kind', ReferenceNodeKind.Enum), [root]);

	return (
		<div className={classes.root}>
			<NavMenu className={classes.nav}>
				<NavMenuItem path={`${pre}/`} exact={true}>Welcome</NavMenuItem>
				{config.categories && config.categories.map(cat => (
					<NavMenuGroup key={cat.name} title={cat.title}>
						{cat.articles.map(article => (
							<NavMenuItem key={article.name} path={`${pre}/docs/${cat.name}/${article.name}`} title={article.title}>{article.title}</NavMenuItem>
						))}
					</NavMenuGroup>
				))}
				{classNodes.length ? (
					<NavMenuGroup title="Classes">
						{classNodes.sort((node1, node2) => node1.name.localeCompare(node2.name)).map(
							value => <NavMenuItem key={value.id} path={`${pre}/reference/classes/${value.name}`} title={value.name}>{value.name}</NavMenuItem>
						)}
					</NavMenuGroup>
				) : null}
				{interfaceNodes.length ? (
					<NavMenuGroup title="Interfaces">
						{interfaceNodes.sort((node1, node2) => node1.name.localeCompare(node2.name)).map(
							value => <NavMenuItem key={value.id} path={`${pre}/reference/interfaces/${value.name}`} title={value.name}>{value.name}</NavMenuItem>
						)}
					</NavMenuGroup>
				) : null}
				{enumNodes.length ? (
					<NavMenuGroup title="Enums">
						{enumNodes.sort((node1, node2) => node1.name.localeCompare(node2.name)).map(
							value => <NavMenuItem key={value.id} path={`${pre}/reference/enums/${value.name}`} title={value.name}>{value.name}</NavMenuItem>
						)}
					</NavMenuGroup>
				) : null}
			</NavMenu>
			<div className={classes.main}>
				<main>
					<PageSwitch/>
				</main>
			</div>
		</div>
	);
};

export default hot(module)(withStyles(styles)(PackageContainer));
