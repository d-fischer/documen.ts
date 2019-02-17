import * as React from 'react';

import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';

const styles = createStyles({
	root: {
		padding: '1em',

		'& h2': {
			margin: 0
		}
	}
});

const PageContent: React.FC<WithSheet<typeof styles>> = ({ classes, children }) => (
	<div className={classes.root}>
		{children}
	</div>
);

export default withStyles(styles)(PageContent);
