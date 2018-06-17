import * as React from 'react';
import * as ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';

import App from './Containers/App';
import { BrowserRouter } from 'react-router-dom';

import { registerLanguage } from 'react-syntax-highlighter/light';
import js from 'react-syntax-highlighter/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/languages/hljs/typescript';

registerLanguage('javascript', js);
registerLanguage('typescript', ts);

ReactDOM.render(
	<BrowserRouter>
		<App />
	</BrowserRouter>,
	document.getElementById('root')
);

// tslint:disable-next-line:no-console
registerServiceWorker().catch(e => console.log('error registering service worker', e));
