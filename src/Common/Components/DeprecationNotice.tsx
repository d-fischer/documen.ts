import * as React from 'react';
import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';

interface DeprecationNoticeProps {
	reason?: React.ReactNode;
}

const styles = createStyles({
	root: {
		color: '#a00',

		'& p': {
			display: 'inline'
		}
	},
	label: {
		textTransform: 'uppercase'
	}
});

const DeprecationNotice: React.FC<DeprecationNoticeProps & WithSheet<typeof styles>> = ({ reason, classes }) => (
	<div className={classes.root}>
		<strong className={classes.label}>Deprecated.</strong> {reason}
	</div>
);

export default withStyles(styles)(DeprecationNotice);
