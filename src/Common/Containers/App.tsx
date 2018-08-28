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

import './App.scss';
import { ReferenceNodeKind } from '../Reference/ReferenceNodeKind';
import config from '../Config';

export class App extends React.Component {
	render() {
		return (
			<div className="App">
				<NavMenu>
					<NavMenu.Item path="/" exact={true}>Welcome</NavMenu.Item>
					{config.categories && config.categories.map(cat => (
						<NavMenu.Group key={cat.name} title={cat.title}>
							{cat.articles.map(article => (
								<NavMenu.Item key={article.name} path={`/docs/${cat.name}/${article.name}`}>{article.title}</NavMenu.Item>
							))}
						</NavMenu.Group>
					))}
					<NavMenu.Group title="Classes">
						{filterByMember(reference.children, 'kind', ReferenceNodeKind.Class).map(value => <NavMenu.Item key={value.id} path={`/reference/classes/${value.name}`}>{value.name}</NavMenu.Item>)}
					</NavMenu.Group>
					<NavMenu.Group title="Interfaces">
						{filterByMember(reference.children, 'kind', ReferenceNodeKind.Interface).map(value => <NavMenu.Item key={value.id} path={`/reference/interfaces/${value.name}`}>{value.name}</NavMenu.Item>)}
					</NavMenu.Group>
					<NavMenu.Group title="Enums">
						{filterByMember(reference.children, 'kind', ReferenceNodeKind.Enum).map(value => <NavMenu.Item key={value.id} path={`/reference/enums/${value.name}`}>{value.name}</NavMenu.Item>)}
					</NavMenu.Group>
				</NavMenu>
				<div className="App__main">
					<main className="App__content">
						<Switch>
							<Route exact={true} path="/" component={IndexPage}/>
							<Route exact={true} path="/docs/:categoryName/:articleName" component={DocPage} />
							<Route exact={true} path="/reference/classes/:name" component={ClassPage}/>
							<Route exact={true} path="/reference/interfaces/:name" component={InterfacePage}/>
							<Route exact={true} path="/reference/enums/:name" component={EnumPage}/>
						</Switch>
					</main>
				</div>
			</div>
		);
	}
}

export default hot(module)(App);
