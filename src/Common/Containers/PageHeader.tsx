import * as React from 'react';

import './PageHeader.scss';

const PageHeader: React.FC = ({ children }) => (
	<div className="PageHeader">
		{children}
	</div>
);

export default PageHeader;
