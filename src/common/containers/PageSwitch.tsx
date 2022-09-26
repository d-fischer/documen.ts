import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ClassPage from '../pages/ClassPage';
import DocPage from '../pages/DocPage';
import EnumPage from '../pages/EnumPage';
import FunctionPage from '../pages/FunctionPage';
import InterfacePage from '../pages/InterfacePage';
import TypeAliasPage from '../pages/TypeAliasPage';

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
