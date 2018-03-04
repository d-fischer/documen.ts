'use strict';

const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const config = require('./webpack.config.dev');
const paths = require('./paths');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';

module.exports = function (allowedHost) {
	return {
		disableHostCheck: false,
		compress: true,
		clientLogLevel: 'none',
		contentBase: paths.appPublic,
		watchContentBase: true,
		hot: true,
		publicPath: config.output.publicPath,
		quiet: true,
		watchOptions: {
			ignored: /node_modules/,
		},
		https: protocol === 'https',
		host: host,
		overlay: false,
		historyApiFallback: {
			// Paths with dots should still use the history fallback.
			// See https://github.com/facebookincubator/create-react-app/issues/387.
			disableDotRule: true,
		},
		public: allowedHost,
		setup(app) {
			// This service worker file is effectively a 'no-op' that will reset any
			// previous service worker registered for the same host:port combination.
			// We do this in development to avoid hitting the production cache if
			// it used the same host and port.
			// https://github.com/facebookincubator/create-react-app/issues/2272#issuecomment-302832432
			app.use(noopServiceWorkerMiddleware());
		},
	};
};
