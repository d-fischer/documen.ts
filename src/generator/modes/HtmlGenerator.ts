import { omit } from '@d-fischer/shared-utils';
import * as vfs from '@typescript/vfs';
import react from '@vitejs/plugin-react';
import fs from 'fs-extra';
import path from 'path';
import * as prettier from 'prettier';
import * as ts from 'typescript';
import resolveHome from 'untildify';
import { build } from 'vite';
import type { ArticleContent } from '../../common/components/PageArticle';
import type { Config, ConfigInternalArticle } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import type { ReferenceNode, SerializedProject } from '../../common/reference';
import { filterByMember } from '../../common/tools/ArrayTools';
import { checkVisibility } from '../../common/tools/NodeTools';
import { getPackagePath } from '../../common/tools/StringTools';
import type { GeneratorProgressCallback } from './Generator';
import { OutputGenerator } from './OutputGenerator';

type RenderEntry = [string, string, Promise<string>];

export default class HtmlGenerator extends OutputGenerator {
	async generate(data: SerializedProject, paths: Paths) {
		const fsMap = await this._generateFsMap();
		await this._buildBundle(data, paths, fsMap);
		await this._generateCommons(paths);
		await this._generateDocs(paths);
		await this._generateReference(data, paths);
	}

	async _generateCommons(paths: Paths) {
		const { shouldEnhance, baseDir, outputDir } = this._config;
		const outDir = path.resolve(baseDir, resolveHome(outputDir));
		if (shouldEnhance) {
			await fs.copyFile(path.join(paths.tmpDir, 'pe.umd.js'), path.join(outDir, 'pe.js'));
		}
	}

	async _generateDocs(paths: Paths, progressCallback?: GeneratorProgressCallback) {
		const { monorepoRoot, baseDir, outputDir, configDir, indexFile, categories, indexTitle } = this._config;
		const outDir = path.resolve(baseDir, resolveHome(outputDir));

		const monoReadmePath = monorepoRoot && !indexFile ? path.join(baseDir, 'README.md') : undefined;
		const pathToRead = configDir
			? monoReadmePath && (await fs.pathExists(monoReadmePath))
				? monoReadmePath
				: path.resolve(configDir, indexFile)
			: undefined;

		const indexPromise = pathToRead && fs.readFile(pathToRead, 'utf-8');

		// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
		const render = require(path.join(paths.tmpDir, 'generator.js'));

		const articleEntries =
			configDir == null
				? []
				: categories?.flatMap(cat => [
						[
							`/docs/${cat.name}/`,
							cat.indexTitle ?? cat.name,
							fs.readFile(path.join(configDir, cat.indexFile!), 'utf-8')
						] as RenderEntry,
						...(cat.groups?.flatMap(
							grp =>
								grp.articles
									?.filter((art): art is ConfigInternalArticle => 'file' in art)
									.map(
										art =>
											[
												`/docs/${cat.name}/${grp.name}/${art.name}`,
												art.title,
												fs.readFile(path.join(configDir, art.file), 'utf-8')
											] as RenderEntry
									) ?? []
						) ?? [])
				  ]) ?? [];

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

	async _generateReference(
		data: SerializedProject,
		paths: Paths,
		subPackage?: string,
		progressCallback?: GeneratorProgressCallback
	) {
		const { monorepoRoot, baseDir, outputDir, packageScope } = this._config;

		const outDir = path.resolve(baseDir, resolveHome(outputDir));
		const pkgPath = getPackagePath(subPackage);

		const fullDir = path.join(outDir, 'reference', pkgPath);

		if (await fs.pathExists(fullDir)) {
			await fs.emptyDir(fullDir);
		} else {
			await fs.mkdirp(fullDir);
		}

		const packageReadmePath = monorepoRoot ? path.join(baseDir, monorepoRoot, subPackage!, 'README.md') : undefined;
		const packageReadmePromise =
			packageReadmePath && (await fs.pathExists(packageReadmePath))
				? fs.readFile(packageReadmePath, 'utf-8')
				: undefined;

		// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
		const render = require(path.join(paths.tmpDir, 'generator.js'));

		const packageData = monorepoRoot
			? data.packages.find(pkg => pkg.packageName === subPackage)!
			: data.packages[0];

		const isNodeVisible = (node: ReferenceNode) => checkVisibility(node);
		const packageChildren = packageData.symbols.filter(isNodeVisible);

		const packageRootPath = `/reference${pkgPath}`;

		const classPaths = filterByMember(packageChildren, 'kind', 'class')
			.filter(isNodeVisible)
			.map(value => `${packageRootPath}/classes/${value.name}`);
		const functionPaths = filterByMember(packageChildren, 'kind', 'function')
			.filter(isNodeVisible)
			.map(value => `${packageRootPath}/functions/${value.name}`);
		const interfacePaths = filterByMember(packageChildren, 'kind', 'interface')
			.filter(isNodeVisible)
			.map(value => `${packageRootPath}/interfaces/${value.name}`);
		const typePaths = filterByMember(packageChildren, 'kind', 'typeAlias')
			.filter(isNodeVisible)
			.map(value => `${packageRootPath}/types/${value.name}`);
		const enumPaths = filterByMember(packageChildren, 'kind', 'enum')
			.filter(isNodeVisible)
			.map(value => `${packageRootPath}/enums/${value.name}`);

		const totalCount =
			1 + classPaths.length + functionPaths.length + interfacePaths.length + typePaths.length + enumPaths.length;

		await this.withProgress(totalCount, progressCallback, async reportProgress => {
			const renderFromPath = async (resourcePath: string) => {
				await this._renderToFile(render, resourcePath, outDir, this._config);

				reportProgress();
			};

			const renderFromEntry = async (entry: RenderEntry) => {
				const [resourcePath, title, contentPromise] = entry;

				await this._renderToFile(render, resourcePath, outDir, this._config, {
					content: await contentPromise,
					title
				});

				reportProgress();
			};

			reportProgress(0);

			if (packageReadmePromise) {
				const packageFullName = packageScope ? `@${packageScope}/${subPackage!}` : subPackage!;
				await renderFromEntry([`${packageRootPath}/`, packageFullName, packageReadmePromise]);
			} else {
				await renderFromPath(`${packageRootPath}/`);
			}

			for (const classPath of classPaths) {
				await renderFromPath(classPath);
			}
			for (const functionPath of functionPaths) {
				await renderFromPath(functionPath);
			}
			for (const interfacePath of interfacePaths) {
				await renderFromPath(interfacePath);
			}
			for (const typePath of typePaths) {
				await renderFromPath(typePath);
			}
			for (const enumPath of enumPaths) {
				await renderFromPath(enumPath);
			}
		});
	}

	async _buildBundle(data: SerializedProject, paths: Paths, fsMap: Map<string, string>) {
		const fsMapEntries = this._config.shouldEnhance ? [...fsMap.entries()] : [];

		const globalDefinitions: Record<string, string> = {
			__DOCTS_REFERENCE: JSON.stringify(data),
			__DOCTS_MOCK_FS: 'null',
			__DOCTS_CONFIG: JSON.stringify(this._config),
			__DOCTS_PATHS: JSON.stringify(omit(paths, ['tmpDir']))
		};

		const externals = ['fs', 'path', 'crypto', 'os'];

		await build({
			mode: 'development',
			configFile: false,
			define: {
				...globalDefinitions,
				__DOCTS_COMPONENT_MODE: JSON.stringify('static'),
				__DOCTS_FSMAP: []
			},
			build: {
				emptyOutDir: true,
				outDir: paths.tmpDir,
				minify: false,
				lib: {
					entry: path.resolve(__dirname, '../../..', './src/html/index.ts'),
					formats: ['cjs'],
					name: 'generator',
					fileName: 'generator'
				},
				rollupOptions: {
					external: externals
				}
			},
			plugins: [react()]
		});

		if (this._config.shouldEnhance) {
			const mode = this._config.dev ? 'development' : 'production';
			await build({
				mode,
				configFile: false,
				define: {
					...globalDefinitions,
					__DOCTS_COMPONENT_MODE: JSON.stringify('dynamic'),
					__DOCTS_FSMAP: JSON.stringify(fsMapEntries),
					'process.env.NODE_ENV': JSON.stringify(mode)
				},
				build: {
					emptyOutDir: false,
					outDir: paths.tmpDir,
					minify: !this._config.dev,
					lib: {
						entry: path.resolve(__dirname, '../../..', './src/progressiveEnhancement/index.tsx'),
						formats: ['umd'],
						name: 'pe',
						fileName: 'pe'
					},
					rollupOptions: {
						external: externals
					}
				},
				plugins: [react()]
			});
		}
	}

	async _generateFsMap() {
		const fsMap = vfs.createDefaultMapFromNodeModules({ target: ts.ScriptTarget.ES2015 });
		vfs.addAllFilesFromFolder(fsMap, path.join(this._config.baseDir, 'node_modules'));
		return fsMap;
	}

	private async _renderToFile(
		render: (filePath: string, config: Config, article?: ArticleContent) => string,
		resourcePath: string,
		outDir: string,
		config: Config,
		content?: ArticleContent
	) {
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
