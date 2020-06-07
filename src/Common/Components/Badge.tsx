import classNames from 'classnames';
import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'inline-block',
		color: theme.colors.background.default,
		backgroundColor: theme.colors.text,
		marginLeft: '1em',
		padding: '2px 5px',
		borderRadius: 5,
		fontSize: 12,
		cursor: 'default'
	},
	rootSmall: {
		padding: '1px 3px',
		fontSize: 10,
		marginLeft: '.5em'
	}
}), { name: 'Badge' });

interface BadgeProps {
	small?: boolean;
	title?: string;
}

const Badge: React.FC<BadgeProps> = ({ small, title, children }) => {
	const classes = useStyles();
	return (
		<span title={title} className={classNames(classes.root, {[classes.rootSmall]: small})}>{children}</span>
	);
};

export default Badge;
