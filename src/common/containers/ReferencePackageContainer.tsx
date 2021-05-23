import { makeStyles } from '@material-ui/styles';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import NavMenu from '../components/NavMenu';
import NavMenuGroup from '../components/NavMenuGroup';
import NavMenuItem from '../components/NavMenuItem';
import type { ClassReferenceNode, EnumReferenceNode, FunctionReferenceNode, InterfaceReferenceNode, ReferenceNode } from '../reference';
import { checkVisibility, defaultNodeSort } from '../tools/NodeTools';
import { getPackageRoot } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';
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
}, { name: 'ReferencePackageContainer' });

export interface PackageContainerRouteParams {
	packageName?: string;
}

const isNodeVisible = (node: ReferenceNode) => checkVisibility(node);

export const ReferencePackageContainer: React.FC = () => {
	const { packageName } = useParams() as unknown as PackageContainerRouteParams;
	const classes = useStyles();

	const pkgPath = getPackagePath(packageName);

	const root = useMemo(() => getPackageRoot(packageName), [packageName]);

	if (!root) {
		return null;
	}

	const classNodes = useMemo(() => root.symbols.filter((sym): sym is ClassReferenceNode => sym.kind === 'class'), [root]).filter(isNodeVisible);
	const functionNodes = useMemo(() => root.symbols.filter((sym): sym is FunctionReferenceNode => sym.kind === 'function'), [root]).filter(isNodeVisible);
	const interfaceNodes = useMemo(() => root.symbols.filter((sym): sym is InterfaceReferenceNode => sym.kind === 'interface'), [root]).filter(isNodeVisible);
	const enumNodes = useMemo(() => root.symbols.filter((sym): sym is EnumReferenceNode => sym.kind === 'enum'), [root]).filter(isNodeVisible);

	/*
	const config = useContext(ConfigContext);
	const relevantConfig = useMemo(() => packageName ? { ...config, ...config.packages?.[packageName] } : config, [packageName, config]);
	{relevantConfig.categories?.map(cat => (
		<NavMenuGroup key={cat.name} title={cat.title}>
			{cat.articles.map(article => 'externalLink' in article ? (
				<NavMenuItem key={article.name} external path={article.externalLink} title={article.title}>{article.title}</NavMenuItem>
			) : (
				<NavMenuItem key={article.name} path={`${pkgPath}/docs/${cat.name}/${article.name}`} title={article.title}>{article.title}</NavMenuItem>
			))}
		</NavMenuGroup>
	))}
	 */

	return (
		<div className={classes.root}>
			<NavMenu className={classes.nav}>
				{classNodes.length ? (
					<NavMenuGroup title="Classes">
						{classNodes.sort(defaultNodeSort).map(
							value => <NavMenuItem key={value.id} path={`/reference${pkgPath}/classes/${value.name}`} title={value.name}>{value.name}</NavMenuItem>
						)}
					</NavMenuGroup>
				) : null}
				{functionNodes.length ? (
					<NavMenuGroup title="Functions">
						{functionNodes.sort(defaultNodeSort).map(
							value => <NavMenuItem key={value.id} path={`/reference${pkgPath}/functions/${value.name}`} title={value.name}>{value.name}</NavMenuItem>
						)}
					</NavMenuGroup>
				) : null}
				{interfaceNodes.length ? (
					<NavMenuGroup title="Interfaces">
						{interfaceNodes.sort(defaultNodeSort).map(
							value => <NavMenuItem key={value.id} path={`/reference${pkgPath}/interfaces/${value.name}`} title={value.name}>{value.name}</NavMenuItem>
						)}
					</NavMenuGroup>
				) : null}
				{enumNodes.length ? (
					<NavMenuGroup title="Enums">
						{enumNodes.sort(defaultNodeSort).map(
							value => <NavMenuItem key={value.id} path={`/reference${pkgPath}/enums/${value.name}`} title={value.name}>{value.name}</NavMenuItem>
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

export default ReferencePackageContainer;
