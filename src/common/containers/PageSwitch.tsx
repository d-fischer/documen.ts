import React, { useContext } from 'react';
import { Route, Switch } from 'react-router';
import IndexPage from '../pages/IndexPage';
import DocPage from '../pages/DocPage';
import ClassPage from '../pages/ClassPage';
import InterfacePage from '../pages/InterfacePage';
import EnumPage from '../pages/EnumPage';
import { ConfigContext } from '../config';

const PageSwitch: React.FunctionComponent = () => {
	const config = useContext(ConfigContext);
	const isMono = !!config.monorepoRoot;

	return isMono ? (
		<Switch>
			<Route exact={true} path="/:packageName" component={IndexPage}/>
			<Route exact={true} path="/:packageName/docs/:categoryName/:articleName" component={DocPage}/>
			<Route exact={true} path="/:packageName/reference/classes/:name" component={ClassPage}/>
			<Route exact={true} path="/:packageName/reference/interfaces/:name" component={InterfacePage}/>
			<Route exact={true} path="/:packageName/reference/enums/:name" component={EnumPage}/>
		</Switch>
	) : (
		<Switch>
			<Route exact={true} path="/" component={IndexPage}/>
			<Route exact={true} path="/docs/:categoryName/:articleName" component={DocPage}/>
			<Route exact={true} path="/reference/classes/:name" component={ClassPage}/>
			<Route exact={true} path="/reference/interfaces/:name" component={InterfacePage}/>
			<Route exact={true} path="/reference/enums/:name" component={EnumPage}/>
		</Switch>
	);
};

export default PageSwitch;
