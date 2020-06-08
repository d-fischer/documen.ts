import classNames from 'classnames';
import React from 'react';
import { DefaultTheme, makeStyles } from '@material-ui/styles';

const useStyles = makeStyles<DefaultTheme, { hasLink: boolean }>(theme => ({
	root: {
		display: 'inline-block',
		color: theme.colors.background.default,
		backgroundColor: theme.colors.text,
		marginLeft: '1em',
		padding: '2px 5px',
		borderRadius: 5,
		fontSize: 12,
		textDecoration: 'none',
		cursor: ({ hasLink }) => hasLink ? 'pointer' : 'default'
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
	href?: string;
}

const Badge: React.FC<BadgeProps> = ({ small, title, href, children }) => {
	const hasLink = !!href;
	const classes = useStyles({ hasLink });
	const Component = hasLink ? 'a' : 'span';
	return (
		<Component href={href} title={title} className={classNames(classes.root, { [classes.rootSmall]: small })}>{children}</Component>
	);
};

export default Badge;
