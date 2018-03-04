import * as React from 'react';
import NavMenuItem from './NavMenuItem';

import './NavMenu.scss';
import NavMenuGroup from './NavMenuGroup';

export default class NavMenu extends React.Component {
	static Item = NavMenuItem;
	static Group = NavMenuGroup;

	render() {
		return (
			<div className="NavMenu">
				{this.props.children}
			</div>
		);
	}
}
