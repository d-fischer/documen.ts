import React from 'react';
import { makeStyles } from '@material-ui/styles';

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

const DeprecationNotice: React.FC = ({ children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<strong className={classes.label}>Deprecated.</strong> {children}
		</div>
	);
};

export default DeprecationNotice;
