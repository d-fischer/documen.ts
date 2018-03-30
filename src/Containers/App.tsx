import * as React from 'react';
import { Route, Switch } from 'react-router';
import { hot } from 'react-hot-loader';

import WelcomePage from '../Pages/WelcomePage';
import ClassPage from '../Pages/ClassPage';

import NavMenu from '../Components/NavMenu';
import reference, { ReferenceNodeKind } from '../Resources/data/reference';
import { filterByMember } from '../Tools/ArrayTools';

import 'font-awesome/css/font-awesome.css';
import './App.scss';

export class App extends React.Component {
	render() {
		return (
			<div className="App">
				<NavMenu>
					<NavMenu.Item path="/" exact={true}>Welcome</NavMenu.Item>
					<NavMenu.Group title="Class reference">
						{filterByMember(reference.children, 'kind', ReferenceNodeKind.Class).map(value => <NavMenu.Item key={value.id} path={`/classes/${value.name}`}>{value.name}</NavMenu.Item>)}
					</NavMenu.Group>
				</NavMenu>
				<div className="App__main">
					<main className="App__content">
						<Switch>
							<Route exact={true} path="/" component={WelcomePage}/>
							<Route exact={true} path="/classes/:clazz" component={ClassPage}/>
						</Switch>
					</main>
				</div>
			</div>
		);
	}
}

export default hot(module)(App);
