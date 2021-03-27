import React, { useContext, useMemo } from 'react';
import { ConfigContext, mockFs } from '../config';
import type { ConfigInternalArticle } from '../config/Config';
import type { PackageContainerRouteParams } from '../containers/PackageContainer';

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

	const { packageName } = useParams<PackageContainerRouteParams>();
	const relevantConfig = useMemo(() => packageName ? { ...config, ...config.packages?.[packageName] } : config, [packageName, config]);

	let title = article?.title;
	let mockContent: string | undefined = undefined;

	if (!title) {
		if (!relevantConfig.categories) {
			return null;
		}

		const category = relevantConfig.categories.find(cat => cat.name === categoryName);
		if (!category) {
			return null;
		}

		const confArticle = category.articles.find(art => art.name === articleName);
		if (!confArticle) {
			return null;
		}

		title = confArticle.title;
		if (mockFs) {
			const fileName = (confArticle as ConfigInternalArticle).file;
			if (fileName) {
				mockContent = mockFs.get(fileName);
			}
		}
	}

	return (
		<>
			<PageHeader>
				<h1>{title}</h1>
			</PageHeader>
			<PageContent>
				<PageArticle mockContent={mockContent}/>
			</PageContent>
		</>
	);
};

export default DocPage;
