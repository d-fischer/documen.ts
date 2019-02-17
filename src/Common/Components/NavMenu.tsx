import * as React from 'react';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';
import classNames = require('classnames');

const styles = createStyles(theme => ({
	root: {
		borderRight: `1px solid ${theme.colors.border}`,
		minHeight: '100%'
	}
}));

interface NavMenuProps {
	className?: string;
}

const NavMenu: React.FC<NavMenuProps & WithSheet<typeof styles>> = ({ children, className, classes }) => (
	<div className={classNames(classes.root, className)}>
		{children}
	</div>
);

export default withStyles(styles)(NavMenu);
