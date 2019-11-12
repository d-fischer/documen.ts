import React from 'react';
import { makeStyles } from '@material-ui/styles';

interface DeprecationNoticeProps {
	reason?: React.ReactNode;
}

const useStyles = makeStyles({
	root: {
		color: '#a00',

		'& p': {
			display: 'inline'
		}
	},
	label: {
		textTransform: 'uppercase'
	}
}, { name: 'DeprecationNotice' });

const DeprecationNotice: React.FC<DeprecationNoticeProps> = ({ reason }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<strong className={classes.label}>Deprecated.</strong> {reason}
		</div>
	);
};

export default DeprecationNotice;
