import React, { useContext } from 'react';
import { Route, Switch } from 'react-router';
import IndexPage from '../Pages/IndexPage';
import DocPage from '../Pages/DocPage';
import ClassPage from '../Pages/ClassPage';
import InterfacePage from '../Pages/InterfacePage';
import EnumPage from '../Pages/EnumPage';
import { ConfigContext } from '../config';

const PageSwitch: React.FunctionComponent = () => {
	const config = useContext(ConfigContext);
	const isMono = !!config.monorepoRoot;

	return isMono ? (
		<Switch>
			<Route exact={true} path="/:package" component={IndexPage}/>
			<Route exact={true} path="/:package/docs/:categoryName/:articleName" component={DocPage}/>
			<Route exact={true} path="/:package/reference/classes/:name" component={ClassPage}/>
			<Route exact={true} path="/:package/reference/interfaces/:name" component={InterfacePage}/>
			<Route exact={true} path="/:package/reference/enums/:name" component={EnumPage}/>
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
