import React from 'react';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import config from '../config';
import PageArticle from '../Components/PageArticle';
import { useParams } from 'react-router';

interface DocPageRouteParams {
	categoryName: string;
	articleName: string;
}

const DocPage: React.FC = () => {
	const { categoryName, articleName } = useParams<DocPageRouteParams>();
	if (!config.categories) {
		return null;
	}

	const category = config.categories.find(cat => cat.name === categoryName);
	if (!category) {
		return null;
	}

	const article = category.articles.find(art => art.name === articleName);
	if (!article) {
		return null;
	}

	return (
		<>
			<PageHeader>
				<h1>{article.title}</h1>
			</PageHeader>
			<PageContent>
				<PageArticle/>
			</PageContent>
		</>
	);
};

export default DocPage;
