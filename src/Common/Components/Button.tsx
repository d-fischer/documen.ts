import * as React from 'react';

import './Button.scss';

type ButtonStyle = 'primary' | 'danger' | 'twitch';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string;
	type?: ButtonStyle;
	small?: boolean;
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.SFC<ButtonProps> = ({ className, type, small, ...props }) => {
	const classes = ['Button'];

	if (small) {
		classes.push('Button--small');
	}

	if (type) {
		classes.push(`Button--${type}`);
	}

	if (className) {
		classes.push(className);
	}

	return <button className={classes.join(' ')} {...props} />;
};

export default Button;
