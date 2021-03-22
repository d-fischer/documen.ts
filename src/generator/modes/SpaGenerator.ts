import path from 'path';
import resolveHome from 'untildify';
import webpack from 'webpack';
import type { Config } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import type { SerializedProject } from '../analyze';
import WebpackBuildError from '../errors/WebpackBuildError';
import WebpackError from '../errors/WebpackError';
import Generator from './Generator';

export default class SpaGenerator extends Generator {
	async generate(data: SerializedProject, paths: Paths) {
		return this._generatePackage(data, paths);
	}

	async _generatePackage(data: SerializedProject, paths: Paths, overrideConfig: Partial<Config> = {}) {
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
