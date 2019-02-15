import * as React from 'react';

import { createStyles, WithSheet } from '../Tools/InjectStyle';
import classNames = require('classnames');

type ButtonStyle = 'primary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string;
	type?: ButtonStyle;
	small?: boolean;
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const styles = createStyles(theme => ({
	root: {
		display: 'inline-block',
		padding: '.4em .8em',
		borderRadius: 5,
		cursor: 'pointer'
	},
	rootSmall: {
		padding: 1,
		borderRadius: 5
	},
	rootPrimary: {
		color: 'white',
		transition: 'background-color .3s ease-in-out, border-color .3s ease-in-out',
		backgroundColor: theme.colors.accent.default,
		borderColor: theme.colors.accent.default,

		'&:hover, &:active, &:focus': {
			color: 'white',
			backgroundColor: theme.colors.accent.focus,
			borderColor: theme.colors.accent.focus
		}
	}
}));

const Button: React.FC<ButtonProps & WithSheet<typeof styles>> = ({ className, classes, type, small, ...props }) => (
	<button
		className={classNames(
			classes.root,
			{
				[classes.rootSmall]: small,
				[classes.rootPrimary]: type === 'primary'
			},
			className
		)}
		{...props}
	/>
);

export default Button;
