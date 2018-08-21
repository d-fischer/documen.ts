import * as React from 'react';
import * as path from 'path';
import { renderToString } from 'react-dom/server';

import StaticRouterWithSuffix from './StaticRouterWithSuffix';
import App from '../Containers/App';
import RouterMode from './RouterMode';
import { StaticRouter } from 'react-router';

const insertIntoSkeleton = (html: string, baseUrl: string = '/') => {
	return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Twitch.js documentation</title>
    <link rel="stylesheet" href="${path.join(baseUrl, '/static/css/style.css')}" />
</head>
<body>
<div id="root">${html}</div>
</body>
</html>`;
};

const render = (url: string, baseUrl: string = '', routerMode: RouterMode = 'server') => {
	let elem: React.ReactElement<any>;
	switch (routerMode) {
		case 'htmlSuffix': {
			elem = (
				<StaticRouterWithSuffix basename={baseUrl} context={{}} location={url} suffix=".html">
					<App/>
				</StaticRouterWithSuffix>
			);
			break;
		}
		case 'htaccess':
		case 'subDirectories':
		case 'server': {
			elem = (
				<StaticRouter basename={baseUrl} context={{}} location={url}>
					<App/>
				</StaticRouter>
			);
			break;
		}
		default: elem = <></>;
	}
	return insertIntoSkeleton(renderToString(elem), baseUrl);
};

export default render;
