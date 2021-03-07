import React, { useContext } from 'react';
import { ConfigContext } from '../config';

import PageHeader from '../containers/PageHeader';
import PageContent from '../containers/PageContent';
import PageArticle, { PageArticleContext } from '../components/PageArticle';

const IndexPage: React.FC = () => {
	const article = useContext(PageArticleContext);
	const config = useContext(ConfigContext);
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
