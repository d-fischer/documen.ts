import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ConfigContext } from '../config';
import DocPage from '../pages/DocPage';
import AppLayout from './AppLayout';
import ReferencePackageContainer from './ReferencePackageContainer';

const App: React.FunctionComponent = () => {
	const config = useContext(ConfigContext);
	const baseUrl = `/${(config.baseUrl || '').replace(/^\//, '')}`;
	const isMono = !!config.monorepoRoot;
	return (
		<>
			<Routes basename={baseUrl}>
				<Route element={<AppLayout />}>
					<Route path="" element={<DocPage/>}/>
					<Route path={isMono ? 'reference/:packageName/*' : '/reference/*'} element={<ReferencePackageContainer/>}/>
					<Route path="docs/:category" element={<DocPage/>}/>
					<Route path="docs/:category/:group/:article" element={<DocPage/>}/>
				</Route>
			</Routes>
		</>
	);
};

export default App;
