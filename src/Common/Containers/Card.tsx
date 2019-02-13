import * as React from 'react';

import './Card.scss';

interface CardProps {
	className?: string;
	id?: string;
}

const Card: React.FC<CardProps> = ({ className, id, children }) => (
	<div id={id} className={`Card${className ? (` ${className}`) : ''}`}>
		{children}
	</div>
);

export default Card;
