import React from 'react';
import { Outlet } from 'react-router';
import MainMenu from '../components/MainMenu.js';

const AppLayout: React.FunctionComponent = () => (
	<>
		<MainMenu />
		<Outlet />
	</>
);

export default AppLayout;
