import * as React from 'react';
import * as ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';

import App from '../Common/Containers/App';
import { BrowserRouter, BrowserRouterProps, HashRouter, HashRouterProps } from 'react-router-dom';

import { registerLanguage } from 'react-syntax-highlighter/light';
import js from 'react-syntax-highlighter/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/languages/hljs/typescript';
import { ThemeProvider } from 'react-jss';
import theme from '../Common/theme';

const Router: React.ComponentType<BrowserRouterProps | HashRouterProps> = process.env.SUPPORTS_DYNAMIC_ROUTING ? BrowserRouter : HashRouter;

registerLanguage('javascript', js);
registerLanguage('js', js);
registerLanguage('typescript', ts);
registerLanguage('ts', ts);

ReactDOM.render(
	<ThemeProvider theme={theme}>
		<Router>
			<App/>
		</Router>
	</ThemeProvider>,
	document.getElementById('root')
);

// eslint-disable-next-line no-console
registerServiceWorker().catch(e => console.log('error registering service worker', e));
