import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ClassPage from '../pages/ClassPage';
import EnumPage from '../pages/EnumPage';
import InterfacePage from '../pages/InterfacePage';

const PageSwitch: React.FunctionComponent = () => (
	<Routes>
		<Route path="classes/:name" element={<ClassPage/>}/>
		<Route path="interfaces/:name" element={<InterfacePage/>}/>
		<Route path="enums/:name" element={<EnumPage/>}/>
	</Routes>
);

export default PageSwitch;
