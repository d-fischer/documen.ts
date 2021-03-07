import React, { useContext } from 'react';
import PackageContainer from './PackageContainer';
import { Route, Switch } from 'react-router';
import MonoIndexPage from '../pages/MonoIndexPage';
import { ConfigContext } from '../config';
import MonoMenu from '../components/MonoMenu';

const App: React.FunctionComponent = () => {
	const config = useContext(ConfigContext);
	const isMono = !!config.monorepoRoot;
	if (isMono) {
		return (
			<>
				<MonoMenu/>
				<Switch>
					<Route exact={true} path="/" component={MonoIndexPage}/>
					<Route path="/:packageName" component={PackageContainer}/>
				</Switch>
			</>
		);
	}

	return (
		<Route component={PackageContainer}/>
	);
};

export default App;
