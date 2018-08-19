import Generator, { GeneratorOptions } from './Generator';
import { argv } from 'yargs';
import * as path from 'path';
import resolveHome = require('untildify');
import webpack = require('webpack');
import { ReferenceNode } from '../../Common/Reference';
import WebpackError from '../Errors/WebpackError';
import WebpackBuildError from '../Errors/WebpackBuildError';

export default class SPAGenerator extends Generator {
	constructor(options: GeneratorOptions) {
		super('spa', options);
	}

	async generate(data: ReferenceNode) {
		return new Promise<void>((resolve, reject) => {
			process.chdir(path.join(__dirname, '../../..'));

			// tslint:disable-next-line:no-var-requires
			const webpackConfig = require('../../../config/webpack.config.spa');

			webpackConfig.output.path = path.resolve(this._options.baseDir!, resolveHome(argv.outDir));

			const webpackCompiler = webpack(webpackConfig);

			if (this._options.webpackProgressCallback) {
				(new webpack.ProgressPlugin(this._options.webpackProgressCallback)).apply(webpackCompiler);
			}

			(new webpack.DefinePlugin({ GENERATED_REFERENCE: JSON.stringify(data) })).apply(webpackCompiler);

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
