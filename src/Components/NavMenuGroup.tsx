import * as React from 'react';

import './NavMenuGroup.scss';

interface NavMenuGroupProps {
	title: string;
}

const NavMenuGroup: React.SFC<NavMenuGroupProps> = ({ title, children }) => (
	<div className="NavMenuGroup">
		<h2 className="NavMenuGroup__title">{title}</h2>
		<div className="NavMenuGroup__items">
			{children}
		</div>
	</div>
);

export default NavMenuGroup;
