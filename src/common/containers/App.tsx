import React, { useContext } from 'react';
import { Route, Routes } from 'react-router';
import { ConfigContext } from '../config/index.js';
import DocPage from '../pages/DocPage.js';
import AppLayout from './AppLayout.js';
import ReferencePackageContainer from './ReferencePackageContainer.js';

const App: React.FunctionComponent = () => {
	const config = useContext(ConfigContext);
	const isMono = !!config.monorepoRoot;
	return (
		<>
			<Routes>
				<Route element={<AppLayout />}>
					<Route path="" element={<DocPage />} />
					<Route
						path={isMono ? 'reference/:packageName/*' : '/reference/*'}
						element={<ReferencePackageContainer />}
					/>
					<Route path="docs/:category" element={<DocPage />} />
					<Route path="docs/:category/:group/:article" element={<DocPage />} />
				</Route>
			</Routes>
		</>
	);
};

export default App;
