import * as vfs from '@typescript/vfs';
import fs from 'fs-extra';
import path from 'path';
import * as ts from 'typescript';
import resolveHome from 'untildify';
import webpack from 'webpack';
import type { ArticleContent } from '../../common/components/PageArticle';
import type { Config, ConfigInternalArticle } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import type { ReferenceNode } from '../../common/reference';
import { filterByMember } from '../../common/tools/ArrayTools';
import { checkVisibility, getChildren } from '../../common/tools/NodeTools';
import { getPackagePath } from '../../common/tools/StringTools';
import WebpackBuildError from '../errors/WebpackBuildError';
import WebpackError from '../errors/WebpackError';
import Generator from './Generator';

type RenderEntry = [string, string, Promise<string>];

export default class HtmlGenerator extends Generator {
	async generate(data: ReferenceNode, paths: Paths) {
		return this._generatePackage(data, paths);
	}

	async _generatePackage(data: ReferenceNode, paths: Paths, overrideConfig: Partial<Config> = {}) {
		const config = {
			...this._config,
			...overrideConfig
		};

		const outDir = path.resolve(config.baseDir, resolveHome(config.outputDir));
		const pre = getPackagePath(config.subPackage);

		const fullDir = path.join(outDir, pre);

		if (await fs.pathExists(fullDir)) {
			await fs.emptyDir(fullDir);
		} else {
			await fs.mkdirp(fullDir);
		}

		// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
		const { default: render } = require(path.join(paths.tmpDir, 'generator.js'));

		if (config.shouldEnhance) {
			await fs.copyFile(path.join(paths.tmpDir, 'pe.js'), path.join(outDir, 'pe.js'));
		}

		const packageData = getChildren(data).find(pkg => pkg.name === config.subPackage)!;

		const packageChildren = getChildren(packageData);
		const monoReadmePath = (config.monorepoRoot && !overrideConfig.indexFile) ? path.join(config.baseDir, config.monorepoRoot, config.subPackage!, 'README.md') : undefined;
		const pathToRead = config.configDir ? (
			monoReadmePath && await fs.pathExists(monoReadmePath)
				? monoReadmePath
				: path.resolve(config.configDir, config.indexFile)
		) : undefined;
		const indexPromise = pathToRead && fs.readFile(pathToRead, 'utf-8');
		const isNodeVisible = (node: ReferenceNode) => checkVisibility(node);
		await Promise.all([
			...(indexPromise ? [[`${pre}/`, config.indexTitle, indexPromise] as RenderEntry] : []),
			...((config.configDir && config.categories) ? config.categories.flatMap(cat => cat.articles.filter((art): art is ConfigInternalArticle => 'file' in art).map(art => ([
				`${pre}/docs/${cat.name}/${art.name}`, art.title, fs.readFile(path.join(config.configDir!, art.file), 'utf-8')
			] as RenderEntry))) : []),
			...filterByMember(packageChildren, 'kind', 'class').filter(isNodeVisible).map(value => `${pre}/reference/classes/${value.name}`),
			...filterByMember(packageChildren, 'kind', 'interface').filter(isNodeVisible).map(value => `${pre}/reference/interfaces/${value.name}`),
			...filterByMember(packageChildren, 'kind', 'enum').filter(isNodeVisible).map(value => `${pre}/reference/enums/${value.name}`)
		].map(async (entry: RenderEntry | string) => {
			if (Array.isArray(entry)) {
				const [resourcePath, title, contentPromise] = entry;
				return this._renderToFile(render, resourcePath, outDir, config, {
					content: await contentPromise,
					title
				});
			}

			return this._renderToFile(render, entry, outDir, config);
		}));
	}

	/** @protected */
	async _buildWebpack(data: ReferenceNode, paths: Paths, fsMap: Map<string, string>, overrideConfig: Partial<Config> = {}) {
		process.chdir(path.join(__dirname, '../../..'));

		const config = {
			...this._config,
			...overrideConfig
		};

		const fsMapEntries = config.shouldEnhance ? [...fsMap.entries()] : [];

		// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-var-requires
		let webpackConfigs = require('../../../config/webpack.config.html')(paths.tmpDir, config) as webpack.Configuration | webpack.Configuration[];
		if (!Array.isArray(webpackConfigs)) {
			webpackConfigs = [webpackConfigs];
		}
		for (const webpackConfig of webpackConfigs) {
			// eslint-disable-next-line @typescript-eslint/no-loop-func
			await new Promise<void>((resolve, reject) => {
				const webpackCompiler = webpack(webpackConfig);

				const { webpackProgressCallback, ...configWithoutCallback } = config;

				if (webpackProgressCallback) {
					(new webpack.ProgressPlugin(webpackProgressCallback)).apply(webpackCompiler);
				}

				/* eslint-disable @typescript-eslint/naming-convention */
				const definitions: Record<string, string> = {
					__DOCTS_REFERENCE: JSON.stringify(data),
					__DOCTS_CONFIG: JSON.stringify(configWithoutCallback),
					__DOCTS_PATHS: JSON.stringify(paths)
				};
				if (config.shouldEnhance && webpackConfig.output?.filename === 'pe.js') {
					definitions.__DOCTS_FSMAP = JSON.stringify(fsMapEntries);
				}
				/* eslint-enable @typescript-eslint/naming-convention */

				(new webpack.DefinePlugin(definitions)).apply(webpackCompiler);

				webpackCompiler.run((err, stats) => {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (err) {
						reject(new WebpackError(err));
					} else if (stats.hasErrors()) {
						reject(new WebpackBuildError(stats));
					} else {
						process.stdout.write('\n\n');
						resolve();
					}
				});
			});
		}
	}

	protected async _generateFsMap() {
		const fsMap = vfs.createDefaultMapFromNodeModules({ target: ts.ScriptTarget.ES2015 });
		vfs.addAllFilesFromFolder(fsMap, path.join(this._config.baseDir, 'node_modules'));
		return fsMap;
	}

	private async _renderToFile(render: (filePath: string, config: Config, article?: ArticleContent) => string, resourcePath: string, outDir: string, config: Config, content?: ArticleContent) {
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
		const str = render(resourcePath, config, content);

		await fs.writeFile(outFile, str);
	}
}
