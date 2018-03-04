import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';

import * as express from 'express';

import App from '../Containers/App';
import render from './htmlTemplate';

export default function router(req: express.Request, res: express.Response) {
	const html = renderToString(
		<StaticRouter context={{}} location={req.url}>
			<App />
		</StaticRouter>
	);

	res.status(200).send(render(html));
}
