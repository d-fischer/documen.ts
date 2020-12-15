import type { Config } from '../../Common/config/Config';
import type Paths from '../../Common/Paths';
import Generator from './Generator';
import path from 'path';
import resolveHome from 'untildify';
import webpack from 'webpack';
import type { ReferenceNode } from '../../Common/reference';
import WebpackError from '../Errors/WebpackError';
import WebpackBuildError from '../Errors/WebpackBuildError';

export default class SpaGenerator extends Generator {
	async generate(data: ReferenceNode, paths: Paths) {
		return this._generatePackage(data, paths);
	}

	async _generatePackage(data: ReferenceNode, paths: Paths, overrideConfig: Partial<Config> = {}) {
		return new Promise<void>((resolve, reject) => {
			process.chdir(path.join(__dirname, '../../..'));

			const config = {
				...this._config,
				...overrideConfig
			};

			// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
			const webpackConfig = require('../../../config/webpack.config.spa') as webpack.Configuration;

			webpackConfig.output!.path = path.resolve(this._config.baseDir, resolveHome(config.outputDir));

			const webpackCompiler = webpack(webpackConfig);

			const { webpackProgressCallback, ...configWithoutCallback } = this._config;

			if (webpackProgressCallback) {
				(new webpack.ProgressPlugin(webpackProgressCallback)).apply(webpackCompiler);
			}

			(new webpack.DefinePlugin({
				/* eslint-disable @typescript-eslint/naming-convention */
				__DOCTS_REFERENCE: JSON.stringify(data),
				__DOCTS_CONFIG: JSON.stringify(configWithoutCallback),
				__DOCTS_PATHS: JSON.stringify(paths)
				/* eslint-enable @typescript-eslint/naming-convention */
			})).apply(webpackCompiler);

			webpackCompiler.run((err, stats) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
