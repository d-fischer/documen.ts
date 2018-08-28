import Generator from './Generator';
import * as path from 'path';
import resolveHome = require('untildify');
import webpack = require('webpack');
import { ReferenceNode } from '../../Common/Reference';
import WebpackError from '../Errors/WebpackError';
import WebpackBuildError from '../Errors/WebpackBuildError';

export default class SPAGenerator extends Generator {
	async generate(data: ReferenceNode) {
		return new Promise<void>((resolve, reject) => {
			process.chdir(path.join(__dirname, '../../..'));

			// tslint:disable-next-line:no-var-requires
			const webpackConfig = require('../../../config/webpack.config.spa');

			webpackConfig.output.path = path.resolve(this._config.baseDir, resolveHome(this._config.outputDir));

			const webpackCompiler = webpack(webpackConfig);

			const { webpackProgressCallback, ...configWithoutCallback } = this._config;

			if (webpackProgressCallback) {
				(new webpack.ProgressPlugin(webpackProgressCallback)).apply(webpackCompiler);
			}

			(new webpack.DefinePlugin({
				__DOCTS_REFERENCE: JSON.stringify(data),
				__DOCTS_CONFIG: JSON.stringify(configWithoutCallback)
			})).apply(webpackCompiler);

			webpackCompiler.run((err, stats) => {
				if (err) {
					reject(new WebpackError(err));
				} else if (stats.hasErrors()) {
					reject(new WebpackBuildError(stats));
				} else {
					resolve();
				}
			});
		});
	}
}
