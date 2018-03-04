import * as React from 'react';

import './PageHeader.scss';

const PageHeader: React.SFC = ({ children }) => (
	<div className="PageHeader">
		{children}
	</div>
);

export default PageHeader;
