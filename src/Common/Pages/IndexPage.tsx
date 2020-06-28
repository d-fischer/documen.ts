import React, { useContext } from 'react';
import { ConfigContext } from '../config';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import PageArticle, { PageArticleContext } from '../Components/PageArticle';

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
