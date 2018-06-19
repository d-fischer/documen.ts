import * as React from 'react';

import './Card.scss';

interface CardProps {
	className?: string;
}

const Card: React.SFC<CardProps> = ({ className, children }) => (
	<div className={`Card${className ? (` ${className}`) : ''}`}>
		{children}
	</div>
);

export default Card;
