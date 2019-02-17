import * as React from 'react';

import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';

interface NavMenuGroupProps {
	title: string;
}

const styles = createStyles(theme => ({
	root: {
		display: 'block',
		color: theme.colors.text,

		'&:not(:first-child)': {
			marginTop: '1em'
		}
	},
	title: {
		margin: 0,
		padding: '.25em .5em .25em .75em',
		fontSize: '1.1em',
		lineHeight: '1em',
		height: '1em',
		fontWeight: 'bold',
		textTransform: 'uppercase'
	},
	items: {
		'& > a': {
			paddingLeft: '1.25em'
		}
	}
}));

const NavMenuGroup: React.FC<NavMenuGroupProps & WithSheet<typeof styles>> = ({ title, children, classes }) => (
	<div className={classes.root}>
		<h2 className={classes.title}>{title}</h2>
		<div className={classes.items}>
			{children}
		</div>
	</div>
);

export default withStyles(styles)(NavMenuGroup);
