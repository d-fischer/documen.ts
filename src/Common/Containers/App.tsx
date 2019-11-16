import React from 'react';
import PackageContainer from './PackageContainer';
import { Route, Switch } from 'react-router';
import MonoIndexPage from '../Pages/MonoIndexPage';
import { isMono } from '../config';
import MonoMenu from '../Components/MonoMenu';
import { hot } from 'react-hot-loader/root';

const App: React.FunctionComponent = isMono ? () => (
	<>
		<MonoMenu/>
		<Switch>
			<Route exact={true} path="/" component={MonoIndexPage}/>
			<Route path="/:packageName" component={PackageContainer}/>
		</Switch>
	</>
) : () => (
	<Route component={PackageContainer}/>
);

export default hot(App);
