import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import React from 'react';

type ButtonStyle = 'primary';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
	className?: string;
	type?: ButtonStyle;
	htmlType?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
	small?: boolean;
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const useStyles = makeStyles(
	theme => ({
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
	}),
	{ name: 'Button' }
);

const Button: React.FC<ButtonProps> = ({ className, type, small, ...props }) => {
	const classes = useStyles();
	return (
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
};

export default Button;
