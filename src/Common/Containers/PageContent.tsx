import * as React from 'react';

import './PageContent.scss';

const PageContent: React.FC = ({ children }) => (
	<div className="PageContent">
		{children}
	</div>
);

export default PageContent;
