import React, { useContext } from 'react';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import config from '../config';
import PageArticle, { PageArticleContext } from '../Components/PageArticle';

const IndexPage: React.FC = () => {
	const article = useContext(PageArticleContext);
	const title = article?.title ?? config.indexTitle;
	return (
		<>
			<PageHeader>
				<h1>{title}</h1>
			</PageHeader>
			<PageContent>
				<PageArticle/>
			</PageContent>
		</>
	);
};

export default IndexPage;
