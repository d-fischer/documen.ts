import Generator from './Generator';
import path from 'path';
import resolveHome from 'untildify';
import webpack from 'webpack';
import { ReferenceNode } from '../../Common/reference';
import WebpackError from '../Errors/WebpackError';
import WebpackBuildError from '../Errors/WebpackBuildError';

export default class SPAGenerator extends Generator {
	async generate(data: ReferenceNode, projectBase: string, sourceBase: string) {
		return new Promise<void>((resolve, reject) => {
			process.chdir(path.join(__dirname, '../../..'));

			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const webpackConfig = require('../../../config/webpack.config.spa');

			webpackConfig.output.path = path.resolve(this._config.baseDir, resolveHome(this._config.outputDir));

			const webpackCompiler = webpack(webpackConfig);

			const { webpackProgressCallback, ...configWithoutCallback } = this._config;

			if (webpackProgressCallback) {
				(new webpack.ProgressPlugin(webpackProgressCallback)).apply(webpackCompiler);
			}

			(new webpack.DefinePlugin({
				__DOCTS_REFERENCE: JSON.stringify(data),
				__DOCTS_CONFIG: JSON.stringify(configWithoutCallback),
				__DOCTS_PATHS: JSON.stringify({ projectBase, sourceBase })
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
