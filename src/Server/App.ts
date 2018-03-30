import * as path from 'path';
import * as express from 'express';
import * as compression from 'compression';
import router from './Router';

const app = express();

const root = path.resolve(__dirname, '..', 'client');
app.use(compression());
app.use(express.static(root));
app.get('*', router);

export default app;
