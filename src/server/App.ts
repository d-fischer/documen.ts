import path from 'path';
import express from 'express';
import compression from 'compression';
import render from '../common/htmlRenderer/HtmlRenderer';

const app = express();

const root = path.resolve(__dirname, '..', 'client');
app.use(compression());
app.use(express.static(root));
app.get('*', (req: express.Request, res: express.Response) => {
	res.status(200).send(render(req.url));
});

export default app;
