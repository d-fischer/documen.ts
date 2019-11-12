import React from 'react';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import config from '../config';
import PageArticle from '../Components/PageArticle';

const IndexPage: React.FC = () => (
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
