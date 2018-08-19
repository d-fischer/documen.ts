import * as React from 'react';

import './PageContent.scss';

const PageContent: React.SFC = ({ children }) => (
	<div className="PageContent">
		{children}
	</div>
);

export default PageContent;
