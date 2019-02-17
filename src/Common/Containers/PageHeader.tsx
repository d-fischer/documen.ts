import * as React from 'react';

import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';

const styles = createStyles(theme => ({
	root: {
		borderBottom: `1px solid ${theme.colors.border}`,
		padding: '1em',
		position: 'relative',
		backgroundColor: theme.colors.background.active,
		color: theme.colors.text,

		'& h1': {
			fontWeight: 'normal',
			margin: 0,
			fontSize: '1.5em',
			display: 'inline'
		},

		'& p': {
			margin: 0
		}
	}
}));

const PageHeader: React.FC<WithSheet<typeof styles>> = ({ children, classes }) => (
	<div className={classes.root}>
		{children}
	</div>
);

export default withStyles(styles)(PageHeader);
