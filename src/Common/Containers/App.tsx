import * as React from 'react';
import PackageContainer from './PackageContainer';
import { Route, Switch } from 'react-router';
import MonoIndexPage from '../Pages/MonoIndexPage';
import { isMono } from '../Config';

const App: React.FunctionComponent = isMono ? () => (
	<Switch>
		<Route exact={true} path="/" component={MonoIndexPage}/>
		<Route path="/:packageName" component={PackageContainer}/>
	</Switch>
) : () => (
	<Route component={PackageContainer}/>
);

export default App;
