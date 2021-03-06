import { makeStyles } from '@material-ui/styles';
import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router';

import NavMenu from '../Components/NavMenu';
import NavMenuGroup from '../Components/NavMenuGroup';
import NavMenuItem from '../Components/NavMenuItem';
import { ConfigContext } from '../config';
import type { ReferenceNode } from '../reference';
import { checkVisibility, filterChildrenByMember } from '../Tools/NodeTools';
import { getPackageRoot } from '../Tools/ReferenceTools';
import { getPackagePath } from '../Tools/StringTools';
import PageSwitch from './PageSwitch';

const useStyles = makeStyles({
	root: {
		display: 'flex',
		flexDirection: 'row',
		width: '100%',
		flex: 1
	},
	nav: {
		width: 250
	},
	main: {
		flex: 1
	}
}, { name: 'PackageContainer' });

interface PackageContainerRouteParams {
	packageName?: string;
}

const isNodeVisible = (node: ReferenceNode) => checkVisibility(node);

export const PackageContainer: React.FC = () => {
	const { packageName } = useParams<PackageContainerRouteParams>();
	const classes = useStyles();
	const config = useContext(ConfigContext);

	const pre = getPackagePath(packageName);

	const root = useMemo(() => getPackageRoot(packageName), [packageName]);

	if (!root) {
		return null;
	}

	const classNodes = useMemo(() => filterChildrenByMember(root, 'kind', 'class'), [root]).filter(isNodeVisible);
	const interfaceNodes = useMemo(() => filterChildrenByMember(root, 'kind', 'interface'), [root]).filter(isNodeVisible);
	const enumNodes = useMemo(() => filterChildrenByMember(root, 'kind', 'enum'), [root]).filter(isNodeVisible);

	return (
		<div className={classes.root}>
			<NavMenu className={classes.nav}>
				<NavMenuItem path={`${pre}/`} exact={true}>Welcome</NavMenuItem>
				{config.categories?.map(cat => (
					<NavMenuGroup key={cat.name} title={cat.title}>
						{cat.articles.map(article => 'externalLink' in article ? (
							<NavMenuItem key={article.name} external path={article.externalLink} title={article.title}>{article.title}</NavMenuItem>
						) : (
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

export default PackageContainer;
