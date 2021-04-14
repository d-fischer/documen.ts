import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router';
import { ConfigContext, mockFs } from '../config';
import type { PackageContainerRouteParams } from '../containers/PackageContainer';

import PageHeader from '../containers/PageHeader';
import PageContent from '../containers/PageContent';
import PageArticle, { PageArticleContext } from '../components/PageArticle';

const IndexPage: React.FC = () => {
	const article = useContext(PageArticleContext);
	const config = useContext(ConfigContext);
	const title = article?.title ?? config.indexTitle;
	let mockContent: string | undefined = undefined;
	const { packageName } = useParams<PackageContainerRouteParams>();
	const relevantConfig = useMemo(() => packageName ? { ...config, ...config.packages?.[packageName] } : config, [packageName, config]);
	if (mockFs && relevantConfig.indexFile) {
		mockContent = mockFs.get(relevantConfig.indexFile);
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

export default IndexPage;
