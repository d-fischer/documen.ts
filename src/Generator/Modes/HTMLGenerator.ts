import Generator from './Generator';
import * as path from 'path';
import resolveHome = require('untildify');
import webpack = require('webpack');
import tmp = require('tmp');
import fs = require('fs-extra');

import { ReferenceNode } from '../../Common/Reference';
import WebpackError from '../Errors/WebpackError';
import WebpackBuildError from '../Errors/WebpackBuildError';
import { filterByMember } from '../../Common/Tools/ArrayTools';
import { ReferenceNodeKind } from '../../Common/Reference/ReferenceNodeKind';
import { ArticleContent } from '../../Common/Components/PageArticle';

type RenderEntry = [string, string, Promise<string>];

export default class HTMLGenerator extends Generator {
	async generate(data: ReferenceNode) {
		const outDir = path.resolve(this._config.baseDir, resolveHome(this._config.outputDir));

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
				try {
					await Promise.all([
						['/', this._config.indexTitle, fs.readFile(this._config.indexFile, 'utf-8')],
						...([] as RenderEntry[]).concat(...((this._config.configDir && this._config.categories) ? this._config.categories.map(cat => cat.articles.map(art => ([
							`/docs/${cat.name}/${art.name}`, art.title, fs.readFile(path.join(this._config.configDir!, art.file), 'utf-8')
						] as RenderEntry))) : [])),
						...filterByMember(data.children, 'kind', ReferenceNodeKind.Class).map(value => `/reference/classes/${value.name}`),
						...filterByMember(data.children, 'kind', ReferenceNodeKind.Interface).map(value => `/reference/interfaces/${value.name}`),
						...filterByMember(data.children, 'kind', ReferenceNodeKind.Enum).map(value => `/reference/enums/${value.name}`)
					].map(async (entry: RenderEntry | string) => {
						if (Array.isArray(entry)) {
							const [resourcePath, title, contentPromise] = entry;
							return this._renderToFile(render, resourcePath, outDir, {
								content: await contentPromise,
								title
							});
						}

						return this._renderToFile(render, entry, outDir);
					}));
				} catch (e) {
					reject(e);
					return;
				} finally {
					cleanup();
				}

				resolve();
			});
		});
	}

	private async _renderToFile(render: (path: string, article?: ArticleContent) => string, resourcePath: string, outDir: string, content?: ArticleContent) {
		let relativeOutFile = resourcePath;
		if (resourcePath.endsWith('/')) {
			relativeOutFile += 'index.html';
		} else if (this._config.routerMode === 'subDirectories') {
			relativeOutFile += '/index.html';
		} else {
			relativeOutFile += '.html';
		}
		const outFile = path.join(outDir, relativeOutFile);
		await fs.mkdirp(path.dirname(outFile));
		const str = render(resourcePath, content);

		await fs.writeFile(outFile, str);
	}

	async _buildWebpack(data: ReferenceNode, outputDirectory: string) {
		return new Promise<void>((resolve, reject) => {
			process.chdir(path.join(__dirname, '../../..'));

			// tslint:disable-next-line:no-var-requires
			const webpackConfig = require('../../../config/webpack.config.html')(outputDirectory);
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
