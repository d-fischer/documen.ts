import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ConfigContext } from '../config';
import type { Config } from '../config/Config';
import StaticRouterWithSuffix from './StaticRouterWithSuffix';
import App from '../containers/App';
import type RouterMode from './RouterMode';
import { StaticRouter } from 'react-router-dom/server';
import type { ArticleContent } from '../components/PageArticle';
import { PageArticleContext } from '../components/PageArticle';
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles';
import theme from '../theme';
import { dom } from '@fortawesome/fontawesome-svg-core';

const insertIntoSkeleton = (html: string, css: string, baseUrl: string, config: Config) =>
	`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>${config.title ?? 'Documentation'}</title>
    <style>
    	@import url('https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap');

		html {
			height: 100%;
		}

		html, body, #app-root {
			width: 100%;
			display: flex;
			flex: 1;
			flex-direction: column;
		}
		
		body {
			margin: 0;
			padding: 0;
			font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
			font-size: 14px;
			line-height: 1.6em;
			background: #141414;
			color: #b9b9b9;
		}
		
		${dom.css()}

	</style>
    ${css ? `<style id="server-side-styles">${css}</style>` : ''}
</head>
<body>
<div id="app-root">${html}</div>
${config.shouldEnhance ? `<script src="${path.posix.join(baseUrl, 'pe.js')}"></script>` : ''}
</body>
</html>`;

const render = (url: string, config: Config, article?: ArticleContent) => {
	// eslint-disable-next-line @typescript-eslint/init-declarations
	let elem: React.ReactElement;
	const baseUrl = path.posix.join('/', config.baseUrl || '');
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const routerMode: RouterMode = config.routerMode || 'server';
	const sheets = new ServerStyleSheets();
	const joinedUrl = path.posix.join(baseUrl, url);

	switch (routerMode) {
		case 'htmlSuffix': {
			elem = (
				<ConfigContext.Provider value={config}>
					<PageArticleContext.Provider value={article}>
						<ThemeProvider theme={theme}>
							<StaticRouterWithSuffix location={joinedUrl} suffix=".html">
								<App/>
							</StaticRouterWithSuffix>
						</ThemeProvider>
					</PageArticleContext.Provider>
				</ConfigContext.Provider>
			);
			break;
		}
		case 'htaccess':
		case 'subDirectories':
		case 'server': {
			elem = (
				<ConfigContext.Provider value={config}>
					<PageArticleContext.Provider value={article}>
						<ThemeProvider theme={theme}>
							<StaticRouter location={joinedUrl}>
								<App/>
							</StaticRouter>
						</ThemeProvider>
					</PageArticleContext.Provider>
				</ConfigContext.Provider>
			);
			break;
		}
		default:
			elem = <></>;
	}
	return insertIntoSkeleton(renderToString(sheets.collect(elem)), sheets.toString(), baseUrl, config);
};

export default render;
