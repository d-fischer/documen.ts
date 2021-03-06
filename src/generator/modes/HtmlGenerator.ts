import { omit } from '@d-fischer/shared-utils';
import * as vfs from '@typescript/vfs';
import fs from 'fs-extra';
import path from 'path';
import * as prettier from 'prettier';
import * as ts from 'typescript';
import resolveHome from 'untildify';
import webpack from 'webpack';
import type { ArticleContent } from '../../common/components/PageArticle';
import type { Config, ConfigInternalArticle } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import type { ReferenceNode, SerializedProject } from '../../common/reference';
import { filterByMember } from '../../common/tools/ArrayTools';
import { checkVisibility } from '../../common/tools/NodeTools';
import { getPackagePath } from '../../common/tools/StringTools';
import WebpackBuildError from '../errors/WebpackBuildError';
import WebpackError from '../errors/WebpackError';
import type { GeneratorProgressCallback } from './Generator';
import { OutputGenerator } from './OutputGenerator';

type RenderEntry = [string, string, Promise<string>];

export default class HtmlGenerator extends OutputGenerator {
	async generate(data: SerializedProject, paths: Paths) {
		await this._generateCommons(paths);
		await this._generateDocs(paths);
		await this._generateReference(data, paths);
	}

	async _generateCommons(paths: Paths) {
		const { shouldEnhance, baseDir, outputDir } = this._config;
		const outDir = path.resolve(baseDir, resolveHome(outputDir));
		if (shouldEnhance) {
			await fs.copyFile(path.join(paths.tmpDir, 'pe.js'), path.join(outDir, 'pe.js'));
		}
	}

	async _generateDocs(paths: Paths, progressCallback?: GeneratorProgressCallback, subPackage?: string) {
		const { monorepoRoot, baseDir, outputDir, configDir, indexFile, categories, indexTitle } = this._config;
		const outDir = path.resolve(baseDir, resolveHome(outputDir));

		const monoReadmePath = (monorepoRoot && !indexFile) ? path.join(baseDir, monorepoRoot, subPackage!, 'README.md') : undefined;
		const pathToRead = configDir ? (
			monoReadmePath && await fs.pathExists(monoReadmePath)
				? monoReadmePath
				: path.resolve(configDir, indexFile)
		) : undefined;

		const indexPromise = pathToRead && fs.readFile(pathToRead, 'utf-8');

		// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
		const { default: render } = require(path.join(paths.tmpDir, 'generator.js'));

		const articleEntries = configDir == null ? [] : categories?.flatMap(
			cat => (
				[
					[`/docs/${cat.name}/`, cat.indexTitle ?? cat.name, fs.readFile(path.join(configDir, cat.indexFile!), 'utf-8')] as RenderEntry,
					...cat.groups?.flatMap(
						grp => grp.articles
								?.filter(
									(art): art is ConfigInternalArticle => 'file' in art
								).map(art => ([`/docs/${cat.name}/${grp.name}/${art.name}`, art.title, fs.readFile(path.join(configDir, art.file), 'utf-8')] as RenderEntry))
							?? []
					) ?? []
				]
			)
		) ?? [];

		const totalCount = +!!indexPromise + articleEntries.length;

		await this.withProgress(totalCount, progressCallback, async reportProgress => {
			const renderFromEntry = async (entry: RenderEntry) => {
				const [resourcePath, title, contentPromise] = entry;

				await this._renderToFile(render, resourcePath, outDir, this._config, {
					content: await contentPromise,
					title
				});

				reportProgress();
			};

			if (indexPromise) {
				await renderFromEntry(['/', indexTitle, indexPromise]);
			}

			for (const articleEntry of articleEntries) {
				await renderFromEntry(articleEntry);
			}
		});
	}

	async _generateReference(data: SerializedProject, paths: Paths, subPackage?: string, progressCallback?: GeneratorProgressCallback) {
		const outDir = path.resolve(this._config.baseDir, resolveHome(this._config.outputDir));
		const pkgPath = getPackagePath(subPackage);

		const fullDir = path.join(outDir, 'reference', pkgPath);

		if (await fs.pathExists(fullDir)) {
			await fs.emptyDir(fullDir);
		} else {
			await fs.mkdirp(fullDir);
		}

		// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
		const { default: render } = require(path.join(paths.tmpDir, 'generator.js'));

		const packageData = data.packages.find(pkg => pkg.packageName === subPackage)!;

		const isNodeVisible = (node: ReferenceNode) => checkVisibility(node);
		const packageChildren = packageData.symbols.filter(isNodeVisible);

		const classPaths = filterByMember(packageChildren, 'kind', 'class').filter(isNodeVisible).map(value => `/reference${pkgPath}/classes/${value.name}`);
		const functionPaths = filterByMember(packageChildren, 'kind', 'function').filter(isNodeVisible).map(value => `/reference${pkgPath}/functions/${value.name}`);
		const interfacePaths = filterByMember(packageChildren, 'kind', 'interface').filter(isNodeVisible).map(value => `/reference${pkgPath}/interfaces/${value.name}`);
		const enumPaths = filterByMember(packageChildren, 'kind', 'enum').filter(isNodeVisible).map(value => `/reference${pkgPath}/enums/${value.name}`);

		const totalCount = 1 + classPaths.length + functionPaths.length + interfacePaths.length + enumPaths.length;

		await this.withProgress(totalCount, progressCallback, async reportProgress => {
			const renderFromPath = async (resourcePath: string) => {
				await this._renderToFile(render, resourcePath, outDir, this._config);

				reportProgress();
			};

			reportProgress(0);

			await renderFromPath(`/reference${pkgPath}/`);

			for (const classPath of classPaths) {
				await renderFromPath(classPath);
			}
			for (const functionPath of functionPaths) {
				await renderFromPath(functionPath);
			}
			for (const interfacePath of interfacePaths) {
				await renderFromPath(interfacePath);
			}
			for (const enumPath of enumPaths) {
				await renderFromPath(enumPath);
			}
		});
	}

	/** @protected */
	async _buildWebpack(data: SerializedProject, paths: Paths, fsMap: Map<string, string>) {
		process.chdir(path.join(__dirname, '../../..'));

		const fsMapEntries = this._config.shouldEnhance ? [...fsMap.entries()] : [];

		// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-var-requires
		let webpackConfigs = require('../../../config/webpack.config.html')(paths.tmpDir, this._config) as webpack.Configuration | webpack.Configuration[];
		if (!Array.isArray(webpackConfigs)) {
			webpackConfigs = [webpackConfigs];
		}
		for (const webpackConfig of webpackConfigs) {
			// eslint-disable-next-line @typescript-eslint/no-loop-func
			await new Promise<void>((resolve, reject) => {
				const webpackCompiler = webpack(webpackConfig);

				if (this._config.webpackProgressCallback) {
					(new webpack.ProgressPlugin(this._config.webpackProgressCallback)).apply(webpackCompiler);
				}

				/* eslint-disable @typescript-eslint/naming-convention */
				const definitions: Record<string, string> = {
					__DOCTS_REFERENCE: JSON.stringify(data),
					__DOCTS_MOCK_FS: 'null',
					__DOCTS_CONFIG: JSON.stringify(omit(this._config, ['webpackProgressCallback'])),
					__DOCTS_PATHS: JSON.stringify(omit(paths, ['tmpDir']))
				};
				if (this._config.shouldEnhance && webpackConfig.output?.filename === 'pe.js') {
					definitions.__DOCTS_FSMAP = JSON.stringify(fsMapEntries);
				}
				/* eslint-enable @typescript-eslint/naming-convention */

				(new webpack.DefinePlugin(definitions)).apply(webpackCompiler);

				webpackCompiler.run((err, stats) => {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (err) {
						reject(new WebpackError(err));
					} else if (stats?.hasErrors()) {
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
		} else if (config.routerMode === 'subDirectories') {
			relativeOutFile += '/index.html';
		} else {
			relativeOutFile += '.html';
		}
		const outFile = path.join(outDir, relativeOutFile);
		await fs.mkdirp(path.dirname(outFile));
		let str = render(resourcePath, config, content);

		if (config.prettier) {
			str = prettier.format(str, { parser: 'html' });
		}

		await fs.writeFile(outFile, str);
	}
}
