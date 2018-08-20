import Generator, { GeneratorOptions } from './Generator';
import * as path from 'path';
import resolveHome = require('untildify');
import webpack = require('webpack');
import tmp = require('tmp');
import fs = require('fs-extra');

import { ReferenceNode } from '../../Common/Reference';
import WebpackError from '../Errors/WebpackError';
import WebpackBuildError from '../Errors/WebpackBuildError';
import RouterMode from '../../Common/HTMLRenderer/RouterMode';

export default class HTMLGenerator extends Generator {
	constructor(options: GeneratorOptions) {
		super('spa', options);
	}

	async generate(data: ReferenceNode) {
		const outDir = path.resolve(this._options.baseDir!, resolveHome(this._options.outDir));

		await fs.emptyDir(outDir);

		return new Promise<void>((resolve, reject) => {
			tmp.dir({ unsafeCleanup: true }, async (err, tmpDir, cleanup) => {
				if (err) {
					reject(err);
					return;
				}

				try {
					await this._buildWebpack(data, tmpDir);
				} catch (e) {
					reject(e);
					return;
				}

				await fs.copy(path.join(tmpDir, 'static'), path.join(outDir, 'static'));

				const { default: render } = require(path.resolve(tmpDir, 'generator.js'));
				await this._renderToFile(render, '/', outDir);
				await this._renderToFile(render, '/classes/Channel', outDir);

				cleanup();
				resolve();
			});
		});
	}

	private async _renderToFile(render: (path: string, routerMode?: RouterMode) => string, resourcePath: string, outDir: string) {
		let relativeOutFile = resourcePath;
		if (resourcePath.endsWith('/')) {
			relativeOutFile += 'index.html';
		} else if (this._options.routerMode === 'subDirectories') {
			relativeOutFile += '/index.html';
		} else {
			relativeOutFile += '.html';
		}
		const outFile = path.join(outDir, relativeOutFile);
		await fs.mkdirp(path.dirname(outFile));
		const str = render(resourcePath, this._options.routerMode);

		await fs.writeFile(outFile, str);
	}

	async _buildWebpack(data: ReferenceNode, outputDirectory: string) {
		return new Promise<void>((resolve, reject) => {
			process.chdir(path.join(__dirname, '../../..'));

			// tslint:disable-next-line:no-var-requires
			const webpackConfig = require('../../../config/webpack.config.html')(outputDirectory);
			const webpackCompiler = webpack(webpackConfig);

			if (this._options.webpackProgressCallback) {
				(new webpack.ProgressPlugin(this._options.webpackProgressCallback)).apply(webpackCompiler);
			}

			(new webpack.DefinePlugin({
				GENERATED_REFERENCE: JSON.stringify(data)
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
