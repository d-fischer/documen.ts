import * as React from 'react';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import config from '../Config';
import PageArticle from '../Components/PageArticle';
import { RouteComponentProps } from 'react-router';

interface DocPageRouteProps {
	categoryName: string;
	articleName: string;
}

const DocPage: React.SFC<RouteComponentProps<DocPageRouteProps>> = ({ match: { params: { categoryName, articleName } } }) => {
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
