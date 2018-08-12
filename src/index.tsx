import * as React from 'react';
import * as ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';

import App from './Containers/App';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import { registerLanguage } from 'react-syntax-highlighter/light';
import js from 'react-syntax-highlighter/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/languages/hljs/typescript';

const Router = process.env.SUPPORTS_DYNAMIC_ROUTING ? BrowserRouter : HashRouter;

registerLanguage('javascript', js);
registerLanguage('typescript', ts);

ReactDOM.render(
	<Router>
		<App />
	</Router>,
	document.getElementById('root')
);

// tslint:disable-next-line:no-console
registerServiceWorker().catch(e => console.log('error registering service worker', e));
