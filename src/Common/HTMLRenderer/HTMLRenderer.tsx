import * as React from 'react';
import * as path from 'path';
import { renderToString } from 'react-dom/server';

import StaticRouterWithSuffix from './StaticRouterWithSuffix';
import App from '../Containers/App';
import RouterMode from './RouterMode';
import { StaticRouter } from 'react-router';
import config from '../Config';
import { ArticleProvider, ArticleContent } from '../Components/PageArticle';
import { createGenerateClassName, JssProvider, SheetsRegistry, ThemeProvider } from 'react-jss';
import theme from '../Theme';

// tslint:disable-next-line:no-import-side-effect
import '@fortawesome/fontawesome-svg-core/styles.css';

const insertIntoSkeleton = (html: string, css?: string) =>
	`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Twitch.js documentation</title>
    <link rel="stylesheet" href="${path.join(config.baseUrl, '/static/css/style.css')}" />
    ${css ? `<style id="server-side-styles">${css}</style>` : ''}
</head>
<body>
<div id="root">${html}</div>
</body>
</html>`;

const render = (url: string, article?: ArticleContent) => {
	let elem: React.ReactElement;
	const baseUrl = config.baseUrl || '';
	const routerMode: RouterMode = config.routerMode || 'server';
	const sheets = new SheetsRegistry();
	const generateClassName = createGenerateClassName();

	switch (routerMode) {
		case 'htmlSuffix': {
			elem = (
				<JssProvider registry={sheets} generateClassName={generateClassName}>
					<ArticleProvider value={article}>
						<ThemeProvider theme={theme}>
							<StaticRouterWithSuffix basename={baseUrl} context={{}} location={url} suffix=".html">
								<App/>
							</StaticRouterWithSuffix>
						</ThemeProvider>
					</ArticleProvider>
				</JssProvider>
			);
			break;
		}
		case 'htaccess':
		case 'subDirectories':
		case 'server': {
			elem = (
				<JssProvider registry={sheets} generateClassName={generateClassName}>
					<ArticleProvider value={article}>
						<ThemeProvider theme={theme}>
							<StaticRouter basename={baseUrl} context={{}} location={url}>
								<App/>
							</StaticRouter>
						</ThemeProvider>
					</ArticleProvider>
				</JssProvider>
			);
			break;
		}
		default:
			elem = <></>;
	}
	return insertIntoSkeleton(renderToString(elem), sheets.toString());
};

export default render;
