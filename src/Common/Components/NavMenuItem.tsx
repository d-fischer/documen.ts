import * as React from 'react';
import { NavLink } from 'react-router-dom';

import './NavMenuItem.scss';

interface NavMenuItemProps {
	path: string;
	exact?: boolean;
	title?: string;
}

const NavMenuItem: React.SFC<NavMenuItemProps> = ({ path, exact, title, children }) => (
	<NavLink to={path} exact={exact} className="NavMenuItem" activeClassName="NavMenuItem--active" title={title}>
		{children}
	</NavLink>
);

export default NavMenuItem;
