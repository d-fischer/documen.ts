import React from 'react';
import { Outlet } from 'react-router-dom';
import MainMenu from '../components/MainMenu';

const AppLayout: React.FunctionComponent = () => (
	<>
		<MainMenu />
		<Outlet />
	</>
);

export default AppLayout;
