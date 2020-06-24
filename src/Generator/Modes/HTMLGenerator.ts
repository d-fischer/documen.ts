import Paths from '../../Common/Paths';
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
import fs from 'fs-extra';
import Config, { ConfigInternalArticle } from '../../Common/config/Config';
import { getChildren } from '../../Common/Tools/NodeTools';

type RenderEntry = [string, string, Promise<string>];

export default class HTMLGenerator extends Generator {
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

		const packageData = getChildren(data).find(pkg => pkg.name === config.subPackage)!;

		const packageChildren = getChildren(packageData);
		const monoReadmePath = (config.monorepoRoot && !overrideConfig.indexFile) ? path.join(config.baseDir, config.monorepoRoot, config.subPackage!, 'README.md') : undefined;
		const pathToRead = config.configDir ? (
			monoReadmePath && await fs.pathExists(monoReadmePath)
				? monoReadmePath
				: path.resolve(config.configDir, config.indexFile)
		) : undefined;
		const indexPromise = pathToRead && fs.readFile(pathToRead, 'utf-8');
		await Promise.all([
			...(indexPromise ? [[`${pre}/`, config.indexTitle, indexPromise]] : []),
			...([] as RenderEntry[]).concat(...((config.configDir && config.categories) ? config.categories.map(cat => cat.articles.filter(art => 'file' in art).map((art: ConfigInternalArticle) => ([
				`${pre}/docs/${cat.name}/${art.name}`, art.title, fs.readFile(path.join(config.configDir!, art.file), 'utf-8')
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
	}

	/** @protected */
	async _buildWebpack(data: ReferenceNode, paths: Paths, overrideConfig: Partial<Config> = {}) {
		return new Promise<void>((resolve, reject) => {
			process.chdir(path.join(__dirname, '../../..'));

			const config = {
				...this._config,
				...overrideConfig
			};

			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const webpackConfig = require('../../../config/webpack.config.html')(paths.tmpDir);
			const webpackCompiler = webpack(webpackConfig);

			const { webpackProgressCallback, ...configWithoutCallback } = config;

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
