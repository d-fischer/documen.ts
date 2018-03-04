import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import registerServiceWorker from './registerServiceWorker';

import App from './Containers/App';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
	<AppContainer>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</AppContainer>,
	document.getElementById('root')
);

if (module.hot) {
	module.hot.accept('./Containers/App', () => {
		// tslint:disable-next-line:no-require-imports
		const NextApp = require('./Containers/App').default;
		ReactDOM.render(
			<AppContainer>
				<BrowserRouter>
					<NextApp />
				</BrowserRouter>
			</AppContainer>,
			document.getElementById('root')
		);
	});
}

// tslint:disable-next-line:no-console
registerServiceWorker().catch(e => console.log('error registering service worker', e));
