import Generator from './Generator';
import path from 'path';

import { ReferenceNode } from '../../Common/reference';
import WebpackError from '../Errors/WebpackError';
import WebpackBuildError from '../Errors/WebpackBuildError';
import { filterByMember} from '../../Common/Tools/ArrayTools';
import { ReferenceNodeKind } from '../../Common/reference/ReferenceNodeKind';
import { ArticleContent } from '../../Common/Components/PageArticle';
import { getPackagePath } from '../../Common/Tools/StringTools';
import resolveHome from 'untildify';
import webpack from 'webpack';
import tmp from 'tmp';
import fs from 'fs-extra';
import { ConfigInternalArticle } from '../../Common/config/Config';
import { getChildren } from '../../Common/Tools/NodeTools';

type RenderEntry = [string, string, Promise<string>];

export default class HTMLGenerator extends Generator {
	async generate(data: ReferenceNode, projectBase: string, sourceBase: string) {
		const outDir = path.resolve(this._config.baseDir, resolveHome(this._config.outputDir));
		const pre = getPackagePath(this._config.subPackage);

		const fullDir = path.join(outDir, pre);

		if (await fs.pathExists(fullDir)) {
			await fs.emptyDir(fullDir);
		} else {
			await fs.mkdirp(fullDir);
		}

		return new Promise<void>((resolve, reject) => {
			tmp.dir({ unsafeCleanup: true }, async (err, tmpDir, cleanup) => {
				if (err) {
					reject(err);
					return;
				}

				try {
					await this._buildWebpack(data, projectBase, sourceBase, tmpDir);
				} catch (e) {
					reject(e);
					return;
				}

				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const { default: render } = require(path.resolve(tmpDir, 'generator.js'));

				const packageData = getChildren(data).find(pkg => pkg.name === this._config.subPackage)!;

				try {
					const packageChildren = getChildren(packageData);
					await Promise.all([
						...(this._config.configDir ? [[`${pre}/`, this._config.indexTitle, fs.readFile(path.resolve(this._config.configDir, this._config.indexFile), 'utf-8')]] : []),
						...([] as RenderEntry[]).concat(...((this._config.configDir && this._config.categories) ? this._config.categories.map(cat => cat.articles.filter(art => 'file' in art).map((art: ConfigInternalArticle) => ([
							`${pre}/docs/${cat.name}/${art.name}`, art.title, fs.readFile(path.join(this._config.configDir!, art.file), 'utf-8')
						] as RenderEntry))) : [])),
						...filterByMember(packageChildren, 'kind', ReferenceNodeKind.Class).map(value => `${pre}/reference/classes/${value.name}`),
						...filterByMember(packageChildren, 'kind', ReferenceNodeKind.Interface).map(value => `${pre}/reference/interfaces/${value.name}`),
						...filterByMember(packageChildren, 'kind', ReferenceNodeKind.Enum).map(value => `${pre}/reference/enums/${value.name}`)
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

	async _buildWebpack(data: ReferenceNode, projectBase: string, sourceBase: string, outputDirectory: string) {
		return new Promise<void>((resolve, reject) => {
			process.chdir(path.join(__dirname, '../../..'));

			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const webpackConfig = require('../../../config/webpack.config.html')(outputDirectory);
			const webpackCompiler = webpack(webpackConfig);

			const { webpackProgressCallback, ...configWithoutCallback } = this._config;

			if (webpackProgressCallback) {
				(new webpack.ProgressPlugin(webpackProgressCallback)).apply(webpackCompiler);
			}

			(new webpack.DefinePlugin({
				/* eslint-disable @typescript-eslint/naming-convention */
				__DOCTS_REFERENCE: JSON.stringify(data),
				__DOCTS_CONFIG: JSON.stringify(configWithoutCallback),
				__DOCTS_PATHS: JSON.stringify({ projectBase, sourceBase })
				/* eslint-enable @typescript-eslint/naming-convention */
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
}
