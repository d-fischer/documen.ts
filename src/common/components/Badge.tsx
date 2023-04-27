import type { DefaultTheme } from '@mui/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import React from 'react';

interface BadgeStyleProps {
	hasLink: boolean;
}

const useStyles = makeStyles<DefaultTheme, BadgeStyleProps>(
	theme => ({
		root: {
			display: 'inline-block',
			color: theme.colors.background.default,
			backgroundColor: theme.colors.text,
			marginLeft: '1em',
			padding: '2px 5px',
			borderRadius: 5,
			fontSize: 12,
			lineHeight: 'normal',
			textDecoration: 'none',
			cursor: ({ hasLink }) => (hasLink ? 'pointer' : 'default')
		},
		rootSmall: {
			padding: '1px 3px',
			fontSize: 10,
			marginLeft: '.5em'
		}
	}),
	{ name: 'Badge' }
);

interface BadgeProps {
	small?: boolean;
	title?: string;
	href?: string;
	className?: string;
}

const Badge: React.FC<React.PropsWithChildren<BadgeProps>> = ({ small, title, href, className, children }) => {
	const hasLink = !!href;
	const classes = useStyles({ hasLink });
	if (hasLink) {
		return (
			<a
				href={href}
				target="_blank"
				title={title}
				className={classNames(classes.root, { [classes.rootSmall]: small }, className)}
				rel="noreferrer"
			>
				{children}
			</a>
		);
	}
	return (
		<span title={title} className={classNames(classes.root, { [classes.rootSmall]: small }, className)}>
			{children}
		</span>
	);
};

export default Badge;
