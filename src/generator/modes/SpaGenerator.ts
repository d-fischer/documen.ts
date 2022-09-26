import path from 'path';
import resolveHome from 'untildify';
import webpack from 'webpack';
import type Paths from '../../common/Paths';
import type { SerializedProject } from '../../common/reference';
import WebpackBuildError from '../errors/WebpackBuildError';
import WebpackError from '../errors/WebpackError';
import { OutputGenerator } from './OutputGenerator';

export default class SpaGenerator extends OutputGenerator {
	async generate(data: SerializedProject, paths: Paths) {
		await this._generateReference(data, paths);
	}

	async _generateReference(data: SerializedProject, paths: Paths) {
		await new Promise<void>((resolve, reject) => {
			process.chdir(path.join(__dirname, '../../..'));

			// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
			const webpackConfig = require('../../../config/webpack.config.spa') as webpack.Configuration;

			webpackConfig.output!.path = path.resolve(this._config.baseDir, resolveHome(this._config.outputDir));

			const webpackCompiler = webpack(webpackConfig);

			new webpack.DefinePlugin({
				__DOCTS_REFERENCE: JSON.stringify(data),
				__DOCTS_CONFIG: JSON.stringify(this._config),
				// TODO
				__DOCTS_MOCK_FS: 'undefined',
				__DOCTS_PATHS: JSON.stringify(paths)
			}).apply(webpackCompiler);

			webpackCompiler.run((err, stats) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (err) {
					reject(new WebpackError(err));
				} else if (stats?.hasErrors()) {
					reject(new WebpackBuildError(stats));
				} else {
					resolve();
				}
			});
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	async _generateCommons(): Promise<void> {}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	async _generateDocs(): Promise<void> {}
}
