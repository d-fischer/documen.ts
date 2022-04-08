import React from 'react';
import { makeStyles } from '@material-ui/styles';

interface NavMenuGroupProps {
	title: string;
}

const useStyles = makeStyles(({ colors: { text: textColor }, spacing: { unit: space } }) => ({
	root: {
		display: 'block',
		color: textColor,
		padding: `${space}px 0`,
	},
	title: {
		margin: 0,
		padding: `${space / 2}px ${space}px ${space / 2}px ${space * 1.5}px`,
		fontSize: '1.1em',
		lineHeight: '1em',
		height: '1em',
		fontWeight: 'bold',
		textTransform: 'uppercase'
	},
	items: {
		'& > a': {
			paddingLeft: space * 2.5
		}
	}
}), { name: 'NavMenuGroup' });

const NavMenuGroup: React.FC<React.PropsWithChildren<NavMenuGroupProps>> = ({ title, children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<h2 className={classes.title}>{title}</h2>
			<div className={classes.items}>
				{children}
			</div>
		</div>
	);
};

export default NavMenuGroup;
