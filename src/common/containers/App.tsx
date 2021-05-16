import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainMenu from '../components/MainMenu';
import { ConfigContext } from '../config';
import DocPage from '../pages/DocPage';
import IndexPage from '../pages/IndexPage';
import ReferencePackageContainer from './ReferencePackageContainer';

const App: React.FunctionComponent = () => {
	const config = useContext(ConfigContext);
	const baseUrl = `/${(config.baseUrl || '').replace(/^\//, '')}`;
	const isMono = !!config.monorepoRoot;
	return (
		<>
			<MainMenu/>
			<Routes basename={baseUrl}>
				<Route path="/" element={<IndexPage/>}/>
				<Route path={isMono ? '/reference/:packageName/*' : '/reference/*'} element={<ReferencePackageContainer/>}/>
				<Route path="/docs/:category" element={<DocPage/>}/>
				<Route path="/docs/:category/:group/:article" element={<DocPage/>}/>
			</Routes>
		</>
	);
};

export default App;
