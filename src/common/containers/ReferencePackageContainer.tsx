import { groupBy } from '@d-fischer/shared-utils';
import { makeStyles } from '@material-ui/styles';
import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import NavMenu from '../components/NavMenu';
import NavMenuGroup from '../components/NavMenuGroup';
import NavMenuItem from '../components/NavMenuItem';
import { ConfigContext } from '../config';
import type {
	ClassReferenceNode,
	EnumReferenceNode,
	FunctionReferenceNode,
	InterfaceReferenceNode,
	ReferenceNode
} from '../reference';
import { partition } from '../tools/ArrayTools';
import { getPageType } from '../tools/CodeTools';
import { checkVisibility, defaultNodeSort } from '../tools/NodeTools';
import { getPackageRoot } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';
import PageSwitch from './PageSwitch';

const useStyles = makeStyles(
	{
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
	},
	{ name: 'ReferencePackageContainer' }
);

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

	const config = useContext(ConfigContext);
	const referenceConfig = useMemo(
		() => (packageName ? config.referenceConfig?.[packageName] : undefined),
		[packageName, config]
	);
	const referenceCategories = referenceConfig?.categories;
	const referenceCategoryNames = referenceCategories?.map(cat => cat.name) ?? [];

	const visibleNodes = useMemo(() => root.symbols.filter(isNodeVisible), [root]);
	const [uncategorizedNodes, categorizedNodes] = useMemo(
		() =>
			partition(visibleNodes, node => {
				const categoryTag = node.comment?.tags?.find(tag => tag.tag === 'category');
				if (!categoryTag?.param) {
					return false;
				}

				return referenceCategoryNames.includes(categoryTag.param);
			}),
		[visibleNodes]
	);

	const nodesByCategory = useMemo(
		() => groupBy(categorizedNodes, node => node.comment!.tags!.find(tag => tag.tag === 'category')!.param!),
		[categorizedNodes]
	);

	const filledReferenceCategories = referenceCategories?.filter(cat =>
		Object.prototype.hasOwnProperty.call(nodesByCategory, cat.name)
	);

	const classNodes = useMemo(
		() => uncategorizedNodes.filter((sym): sym is ClassReferenceNode => sym.kind === 'class'),
		[root]
	);
	const functionNodes = useMemo(
		() => uncategorizedNodes.filter((sym): sym is FunctionReferenceNode => sym.kind === 'function'),
		[root]
	);
	const interfaceNodes = useMemo(
		() => uncategorizedNodes.filter((sym): sym is InterfaceReferenceNode => sym.kind === 'interface'),
		[root]
	);
	const enumNodes = useMemo(
		() => uncategorizedNodes.filter((sym): sym is EnumReferenceNode => sym.kind === 'enum'),
		[root]
	);

	return (
		<div className={classes.root}>
			<NavMenu className={classes.nav}>
				{filledReferenceCategories?.map(cat => (
					<NavMenuGroup key={cat.name} title={cat.title}>
						{nodesByCategory[cat.name]!.map(node => (
							<NavMenuItem
								key={node.id}
								path={`/reference${pkgPath}/${getPageType(node)}/${node.name}`}
								title={node.name}
							>
								{node.name}
							</NavMenuItem>
						))}
					</NavMenuGroup>
				)) ?? null}
				{classNodes.length ? (
					<NavMenuGroup title="Classes">
						{classNodes.sort(defaultNodeSort).map(value => (
							<NavMenuItem
								key={value.id}
								path={`/reference${pkgPath}/classes/${value.name}`}
								title={value.name}
							>
								{value.name}
							</NavMenuItem>
						))}
					</NavMenuGroup>
				) : null}
				{functionNodes.length ? (
					<NavMenuGroup title="Functions">
						{functionNodes.sort(defaultNodeSort).map(value => (
							<NavMenuItem
								key={value.id}
								path={`/reference${pkgPath}/functions/${value.name}`}
								title={value.name}
							>
								{value.name}
							</NavMenuItem>
						))}
					</NavMenuGroup>
				) : null}
				{interfaceNodes.length ? (
					<NavMenuGroup title="Interfaces">
						{interfaceNodes.sort(defaultNodeSort).map(value => (
							<NavMenuItem
								key={value.id}
								path={`/reference${pkgPath}/interfaces/${value.name}`}
								title={value.name}
							>
								{value.name}
							</NavMenuItem>
						))}
					</NavMenuGroup>
				) : null}
				{enumNodes.length ? (
					<NavMenuGroup title="Enums">
						{enumNodes.sort(defaultNodeSort).map(value => (
							<NavMenuItem
								key={value.id}
								path={`/reference${pkgPath}/enums/${value.name}`}
								title={value.name}
							>
								{value.name}
							</NavMenuItem>
						))}
					</NavMenuGroup>
				) : null}
			</NavMenu>
			<div className={classes.main}>
				<main>
					<PageSwitch />
				</main>
			</div>
		</div>
	);
};

export default ReferencePackageContainer;
