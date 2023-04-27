import { Light as SyntaxHighlighter } from '@d-fischer/react-syntax-highlighter';
import js from '@d-fischer/react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import json from '@d-fischer/react-syntax-highlighter/dist/esm/languages/hljs/json';
import ts from '@d-fischer/react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { ThemeProvider } from '@mui/styles';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import App from '../common/containers/App';
import theme from '../common/theme';

import registerServiceWorker from './registerServiceWorker';

const Router = process.env.SUPPORTS_DYNAMIC_ROUTING ? BrowserRouter : HashRouter;

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('js', js);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('ts', ts);

ReactDOM.render(
	<ThemeProvider theme={theme}>
		<Router>
			<App />
		</Router>
	</ThemeProvider>,
	document.getElementById('app-root')
);

// eslint-disable-next-line no-console
registerServiceWorker().catch(e => console.log('error registering service worker', e));
