import React from 'react';
import { Route, Routes } from 'react-router';
import ClassPage from '../pages/ClassPage.js';
import DocPage from '../pages/DocPage.js';
import EnumPage from '../pages/EnumPage.js';
import FunctionPage from '../pages/FunctionPage.js';
import InterfacePage from '../pages/InterfacePage.js';
import TypeAliasPage from '../pages/TypeAliasPage.js';

const PageSwitch: React.FunctionComponent = () => (
	<Routes>
		<Route path="/" element={<DocPage />} />
		<Route path="classes/:name" element={<ClassPage />} />
		<Route path="functions/:name" element={<FunctionPage />} />
		<Route path="interfaces/:name" element={<InterfacePage />} />
		<Route path="types/:name" element={<TypeAliasPage />} />
		<Route path="enums/:name" element={<EnumPage />} />
	</Routes>
);

export default PageSwitch;
