import * as React from 'react';
import { NavLink } from 'react-router-dom';

import './NavMenuItem.scss';

interface NavMenuItemProps {
	path: string;
	exact?: boolean;
}

const NavMenuItem: React.SFC<NavMenuItemProps> = ({ path, exact, children }) => (
	<NavLink to={path} exact={exact} className="NavMenuItem" activeClassName="NavMenuItem--active">
		{children}
	</NavLink>
);

export default NavMenuItem;
