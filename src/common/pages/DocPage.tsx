import React, { useContext } from 'react';
import { ConfigContext } from '../config';

import PageHeader from '../containers/PageHeader';
import PageContent from '../containers/PageContent';
import PageArticle, { PageArticleContext } from '../components/PageArticle';
import { useParams } from 'react-router';

interface DocPageRouteParams {
	categoryName: string;
	articleName: string;
}

const DocPage: React.FC = () => {
	const { categoryName, articleName } = useParams<DocPageRouteParams>();
	const article = useContext(PageArticleContext);
	const config = useContext(ConfigContext);

	let title = article?.title;

	if (!title) {
		if (!config.categories) {
			return null;
		}

		const category = config.categories.find(cat => cat.name === categoryName);
		if (!category) {
			return null;
		}

		const confArticle = category.articles.find(art => art.name === articleName);
		if (!confArticle) {
			return null;
		}

		title = confArticle.title;
	}

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

export default DocPage;
