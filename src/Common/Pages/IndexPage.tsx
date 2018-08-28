import * as React from 'react';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import config from '../Config';
import PageArticle from '../Components/PageArticle';

const IndexPage: React.SFC = () => (
	<>
		<PageHeader>
			<h1>{config.indexTitle}</h1>
		</PageHeader>
		<PageContent>
			<PageArticle/>
		</PageContent>
	</>
);

export default IndexPage;
