import React from 'react';

import PageHeader from '../containers/PageHeader';
import PageContent from '../containers/PageContent';

const IndexPage: React.FunctionComponent = () => (
	<>
		<PageHeader>
			<h1>Hi</h1>
		</PageHeader>
		<PageContent>
			<p>Some content here soon™!</p>
			<p>Meanwhile, just check the menu above.</p>
		</PageContent>
	</>
);

export default IndexPage;
