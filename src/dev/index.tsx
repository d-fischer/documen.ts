import { Light as SyntaxHighlighter } from '@d-fischer/react-syntax-highlighter';
import js from '@d-fischer/react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import json from '@d-fischer/react-syntax-highlighter/dist/esm/languages/hljs/json';
import ts from '@d-fischer/react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { ThemeProvider } from '@mui/styles';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router';

import App from '../common/containers/App.js';
import theme from '../common/theme.js';

import registerServiceWorker from './registerServiceWorker.js';

const Router = process.env.SUPPORTS_DYNAMIC_ROUTING ? BrowserRouter : HashRouter;

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('js', js);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('ts', ts);

const root = createRoot(document.getElementById('app-root'));

root.render(
	<ThemeProvider theme={theme}>
		<Router>
			<App />
		</Router>
	</ThemeProvider>
);

// eslint-disable-next-line no-console
registerServiceWorker().catch(e => console.log('error registering service worker', e));
