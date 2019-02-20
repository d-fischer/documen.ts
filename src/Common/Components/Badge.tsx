import * as React from 'react';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';

const styles = createStyles(theme => ({
	root: {
		display: 'inline-block',
		color: theme.colors.background.default,
		backgroundColor: theme.colors.text,
		marginLeft: '1em',
		padding: '2px 5px',
		borderRadius: 5
	}
}));

const Badge: React.FC<WithSheet<typeof styles>> = ({ classes, children }) => (
	<span className={classes.root}>{children}</span>
);

export default withStyles(styles)(Badge);
