import * as React from 'react';

import { createStyles, WithSheet, withStyles } from '../Tools/InjectStyle';
import classNames = require('classnames');

interface CardProps {
	className?: string;
	id?: string;
}

const styles = createStyles(theme => ({
	root: {
		margin: '1em',
		padding: '1em',
		border: `1px solid ${theme.colors.border}`,

		'& h3, & h4': {
			margin: 0
		}
	}
}));

const Card: React.FC<CardProps & WithSheet<typeof styles>> = ({ classes, className, id, children }) => (
	<div id={id} className={classNames(classes.root, className)}>
		{children}
	</div>
);

export default withStyles(styles)(Card);
