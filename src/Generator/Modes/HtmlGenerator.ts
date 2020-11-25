import * as ts from 'typescript';
import * as vfs from '@typescript/vfs';
import fs from 'fs-extra';
import path from 'path';
import resolveHome from 'untildify';
import webpack from 'webpack';
import { ArticleContent } from '../../Common/Components/PageArticle';
import Config, { ConfigInternalArticle } from '../../Common/config/Config';
import Paths from '../../Common/Paths';
import { ReferenceNode } from '../../Common/reference';
import { ReferenceNodeKind } from '../../Common/reference/ReferenceNodeKind';
import { filterByMember } from '../../Common/Tools/ArrayTools';
import { checkVisibility, getChildren } from '../../Common/Tools/NodeTools';
import { getPackagePath } from '../../Common/Tools/StringTools';
import WebpackBuildError from '../Errors/WebpackBuildError';
import WebpackError from '../Errors/WebpackError';
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

		// eslint-disable-next-line @typescript-eslint/no-require-imports
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
			...(indexPromise ? [[`${pre}/`, config.indexTitle, indexPromise]] : []),
			...([] as RenderEntry[]).concat(...((config.configDir && config.categories) ? config.categories.map(cat => cat.articles.filter(art => 'file' in art).map((art: ConfigInternalArticle) => ([
				`${pre}/docs/${cat.name}/${art.name}`, art.title, fs.readFile(path.join(config.configDir!, art.file), 'utf-8')
			] as RenderEntry))) : [])),
			...filterByMember(packageChildren, 'kind', ReferenceNodeKind.Class).filter(isNodeVisible).map(value => `${pre}/reference/classes/${value.name}`),
			...filterByMember(packageChildren, 'kind', ReferenceNodeKind.Interface).filter(isNodeVisible).map(value => `${pre}/reference/interfaces/${value.name}`),
			...filterByMember(packageChildren, 'kind', ReferenceNodeKind.Enum).filter(isNodeVisible).map(value => `${pre}/reference/enums/${value.name}`)
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

		// eslint-disable-next-line @typescript-eslint/no-require-imports
		let webpackConfigs = require('../../../config/webpack.config.html')(paths.tmpDir);
		if (!Array.isArray(webpackConfigs)) {
			webpackConfigs = [webpackConfigs];
		}
		for (const webpackConfig of webpackConfigs) {
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
				if (config.shouldEnhance && webpackConfig.output.filename === 'pe.js') {
					definitions.__DOCTS_FSMAP = JSON.stringify(fsMapEntries);
				}
				/* eslint-enable @typescript-eslint/naming-convention */

				(new webpack.DefinePlugin(definitions)).apply(webpackCompiler);

				webpackCompiler.run((err, stats) => {
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