import React from 'react';
import ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';

import App from '../Common/Containers/App';
import type { BrowserRouterProps, HashRouterProps } from 'react-router-dom';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { ThemeProvider } from '@material-ui/styles';
import theme from '../Common/theme';

const Router: React.ComponentType<BrowserRouterProps | HashRouterProps> = process.env.SUPPORTS_DYNAMIC_ROUTING ? BrowserRouter : HashRouter;

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('js', js);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('ts', ts);

ReactDOM.render(
	<ThemeProvider theme={theme}>
		<Router>
			<App/>
		</Router>
	</ThemeProvider>,
	document.getElementById('app-root')
);

// eslint-disable-next-line no-console
registerServiceWorker().catch(e => console.log('error registering service worker', e));
