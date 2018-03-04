import * as React from 'react';

import './Card.scss';

const Card: React.SFC = ({ children }) => (
	<div className="Card">
		{children}
	</div>
);

export default Card;
