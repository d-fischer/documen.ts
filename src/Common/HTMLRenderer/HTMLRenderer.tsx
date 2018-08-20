import * as React from 'react';
import { renderToString } from 'react-dom/server';

import StaticRouterWithSuffix from './StaticRouterWithSuffix';
import App from '../Containers/App';
import RouterMode from './RouterMode';
import { StaticRouter } from 'react-router';

const insertIntoSkeleton = (html: string) => {
	return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Twitch.js documentation</title>
    <link rel="stylesheet" href="/static/css/style.css" />
</head>
<body>
<div id="root">${html}</div>
<script src="/static/js/bundle.js"></script>
</body>
</html>`;
};

const render = (url: string, routerMode: RouterMode = 'server') => {
	let elem: React.ReactElement<any>;
	switch (routerMode) {
		case 'htmlSuffix': {
			elem = (
				<StaticRouterWithSuffix context={{}} location={url} suffix=".html">
					<App/>
				</StaticRouterWithSuffix>
			);
			break;
		}
		case 'htaccess':
		case 'subDirectories':
		case 'server': {
			elem = (
				<StaticRouter context={{}} location={url}>
					<App/>
				</StaticRouter>
			);
			break;
		}
		default: elem = <></>;
	}
	return insertIntoSkeleton(renderToString(elem));
};

export default render;
