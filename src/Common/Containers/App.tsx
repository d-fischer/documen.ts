import * as React from 'react';
import { Route, Switch } from 'react-router';
import { hot } from 'react-hot-loader';

import IndexPage from '../Pages/IndexPage';
import DocPage from '../Pages/DocPage';
import ClassPage from '../Pages/ClassPage';
import InterfacePage from '../Pages/InterfacePage';
import EnumPage from '../Pages/EnumPage';

import NavMenu from '../Components/NavMenu';
import reference from '../Reference';
import { filterByMember } from '../Tools/ArrayTools';

import { ReferenceNodeKind } from '../Reference/ReferenceNodeKind';
import config from '../Config';
import NavMenuGroup from '../Components/NavMenuGroup';
import NavMenuItem from '../Components/NavMenuItem';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';
import * as Color from 'color';

import '../style.css';

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

export const App: React.FC<WithSheet<typeof styles>> = ({ classes }) => {
	const classNodes = filterByMember(reference.children, 'kind', ReferenceNodeKind.Class);
	const interfaceNodes = filterByMember(reference.children, 'kind', ReferenceNodeKind.Interface);
	const enumNodes = filterByMember(reference.children, 'kind', ReferenceNodeKind.Enum);
	return (
		<div className={classes.root}>
			<NavMenu className={classes.nav}>
				<NavMenuItem path="/" exact={true}>Welcome</NavMenuItem>
				{config.categories && config.categories.map(cat => (
					<NavMenuGroup key={cat.name} title={cat.title}>
						{cat.articles.map(article => (
							<NavMenuItem key={article.name} path={`/docs/${cat.name}/${article.name}`} title={article.title}>{article.title}</NavMenuItem>
						))}
					</NavMenuGroup>
				))}
				{classNodes.length ? (
					<NavMenuGroup title="Classes">
						{classNodes.map(value => <NavMenuItem key={value.id} path={`/reference/classes/${value.name}`} title={value.name}>{value.name}</NavMenuItem>)}
					</NavMenuGroup>
				) : null}
				{interfaceNodes.length ? (
					<NavMenuGroup title="Interfaces">
						{interfaceNodes.map(value => <NavMenuItem key={value.id} path={`/reference/interfaces/${value.name}`} title={value.name}>{value.name}</NavMenuItem>)}
					</NavMenuGroup>
				) : null}
				{enumNodes.length ? (
					<NavMenuGroup title="Enums">
						{enumNodes.map(value => <NavMenuItem key={value.id} path={`/reference/enums/${value.name}`} title={value.name}>{value.name}</NavMenuItem>)}
					</NavMenuGroup>
				) : null}
			</NavMenu>
			<div className={classes.main}>
				<main>
					<Switch>
						<Route exact={true} path="/" component={IndexPage}/>
						<Route exact={true} path="/docs/:categoryName/:articleName" component={DocPage}/>
						<Route exact={true} path="/reference/classes/:name" component={ClassPage}/>
						<Route exact={true} path="/reference/interfaces/:name" component={InterfacePage}/>
						<Route exact={true} path="/reference/enums/:name" component={EnumPage}/>
					</Switch>
				</main>
			</div>
		</div>
	);
};

export default hot(module)(withStyles(styles)(App));
