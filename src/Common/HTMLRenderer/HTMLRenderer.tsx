import * as React from 'react';
import * as path from 'path';
import { renderToString } from 'react-dom/server';

import StaticRouterWithSuffix from './StaticRouterWithSuffix';
import App from '../Containers/App';
import RouterMode from './RouterMode';
import { StaticRouter } from 'react-router';
import config from '../Config';
import { ArticleProvider, ArticleContent } from '../Components/PageArticle';

const insertIntoSkeleton = (html: string) => {
	return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Twitch.js documentation</title>
    <link rel="stylesheet" href="${path.join(config.baseUrl, '/static/css/style.css')}" />
</head>
<body>
<div id="root">${html}</div>
</body>
</html>`;
};

const render = (url: string, article?: ArticleContent) => {
	let elem: React.ReactElement<any>;
	const baseUrl = config.baseUrl || '';
	const routerMode: RouterMode = config.routerMode || 'server';
	switch (routerMode) {
		case 'htmlSuffix': {
			elem = (
				<ArticleProvider value={article}>
					<StaticRouterWithSuffix basename={baseUrl} context={{}} location={url} suffix=".html">
						<App/>
					</StaticRouterWithSuffix>
				</ArticleProvider>
			);
			break;
		}
		case 'htaccess':
		case 'subDirectories':
		case 'server': {
			elem = (
				<ArticleProvider value={article}>
					<StaticRouter basename={baseUrl} context={{}} location={url}>
						<App/>
					</StaticRouter>
				</ArticleProvider>
			);
			break;
		}
		default: elem = <></>;
	}
	return insertIntoSkeleton(renderToString(elem));
};

export default render;
