import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import React from 'react';

const useStyles = makeStyles(
	theme => ({
		root: {
			borderRight: `1px solid ${theme.colors.border}`,
			minHeight: '100%'
		}
	}),
	{ name: 'NavMenu' }
);

interface NavMenuProps {
	className?: string;
}

const NavMenu: React.FC<React.PropsWithChildren<NavMenuProps>> = ({ children, className }) => {
	const classes = useStyles();
	return <div className={classNames(classes.root, className)}>{children}</div>;
};

export default NavMenu;
