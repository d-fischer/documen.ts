/// <reference lib="es2019.object" />

import { mapOptional } from '@d-fischer/shared-utils';
import * as vfs from '@typescript/vfs';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import type { OutputChunk } from 'rollup';
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import toposort from 'toposort';
import type { PackageJson } from 'type-fest';
import * as ts from 'typescript';
import type { Config } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import type { SerializedProject } from '../../common/reference';
import { parseConfig, parseConfigObject } from '../../common/tools/ConfigTools';
import { fileExists } from '../../common/tools/FileTools';
import { Project } from '../analyzer/Project';
import Generator from './Generator';
import HtmlGenerator from './HtmlGenerator';
import type { OutputGenerator } from './OutputGenerator';
import SpaGenerator from './SpaGenerator';

export default class MonorepoGenerator extends Generator {
	async createReferenceStructure() {
		const project = new Project(this._config);

		const packageDirNames = this._config.packageDirNames!;
		const packageDirsToPackageJson = new Map(
			await Promise.all(
				packageDirNames.map(async dirName => {
					const packageFolder = path.join(this._config.baseDir, this._config.monorepoRoot!, dirName);
					const packageJson = JSON.parse(
						await fs.readFile(path.join(packageFolder, 'package.json'), 'utf8')
					) as PackageJson;

					return [dirName, packageJson] as const;
				})
			)
		);
		const packageNames = [...packageDirsToPackageJson.values()].map(packageJson => packageJson.name!);

		const packageDirsToNames = new Map(
			[...packageDirsToPackageJson].map(([packageDirName, packageJson]) => [packageDirName, packageJson.name!])
		);
		const packageNamesToDirs = new Map(
			[...packageDirsToPackageJson].map(([packageDirName, packageJson]) => [packageJson.name!, packageDirName])
		);

		const dependencies = [...packageDirsToPackageJson].flatMap(([packageDirName, packageJson]) =>
			[...Object.keys(packageJson.dependencies ?? {}), ...Object.keys(packageJson.devDependencies ?? {})]
				.filter(dep => packageNames.includes(dep) && dep !== packageJson.name!)
				.map(dep => [dep, packageDirsToNames.get(packageDirName)!] as [string, string])
		);

		const sortedPackageNames = toposort(dependencies);

		const namesInScope = this._config.packageScope
			? sortedPackageNames.filter(p => p.startsWith(`@${this._config.packageScope!}/`))
			: sortedPackageNames;

		if (!this._config.packageScope && namesInScope.some(n => n.includes('/'))) {
			throw new Error('Slashes in package names detected. You should probably use the `packageScope` option.');
		}

		const rootProgram = await this._createReferenceRootProgram(packageDirsToPackageJson);

		for (const packageName of namesInScope) {
			const packageDir = packageNamesToDirs.get(packageName)!;
			await project.analyzeMonorepoPackage(packageDir, packageDirsToPackageJson.get(packageDir)!, rootProgram);
		}

		project.fixBrokenReferences();

		const result = project.serialize();

		const scopedMainPackage =
			this._config.packageScope && this._config.mainPackage
				? `@${this._config.packageScope}/${this._config.mainPackage}`
				: this._config.mainPackage;

		result.packages.sort((a, b) => {
			if (a.packageName === scopedMainPackage) {
				return -1;
			}

			if (b.packageName === scopedMainPackage) {
				return 1;
			}

			return a.packageName.localeCompare(b.packageName);
		});

		return result;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async _generateReference(data: SerializedProject, paths: Paths) {
		// stub
	}

	async generate(data: SerializedProject, paths: Paths) {
		const generator = this._createGenerator(this._config);

		const { ignoredPackages } = this._config;

		const fsMap = await this._generateFsMap(data, paths);
		await generator._buildWebpack(data, paths, fsMap);

		await generator._generateCommons(paths);

		const docsThrobber = ora({ text: 'Building docs...', color: 'blue' }).start();
		await generator._generateDocs(paths, (progress, total) => {
			docsThrobber.text = `Building docs (${progress}/${total})...`;
		});
		docsThrobber.succeed();

		if (ignoredPackages?.length) {
			process.stdout.write(`Not building reference for package(s): ${ignoredPackages.join(', ')}\n`);
		}

		for (const pkg of data.packages) {
			const subPackage = pkg.packageName;

			if (this._config.ignoredPackages?.includes(subPackage)) {
				continue;
			}

			const referenceThrobber = ora({
				text: `Building reference for package ${subPackage}...`,
				color: 'blue'
			}).start();
			await generator._generateReference(data, paths, subPackage, (progress, total) => {
				referenceThrobber.text = `Building reference for package ${subPackage} (${progress}/${total})...`;
			});
			referenceThrobber.succeed();
		}
	}

	protected async _generateFsMap(data: SerializedProject, paths: Paths): Promise<Map<string, string>> {
		const input = Object.fromEntries(
			data.packages.map(pkg => {
				let packageName = pkg.packageName;
				if (this._config.packageScope) {
					packageName = `${this._config.packageScope}__${packageName}`;
				}
				return [
					packageName,
					path.join(paths.projectBase, this._config.monorepoRoot!, pkg.folderName!, 'lib', 'index.d.ts')
				];
			})
		);
		const bundle = await rollup({
			// TODO get proper entry point
			input: input,
			plugins: [dts()]
		});
		const { output } = await bundle.generate({ format: 'es' });

		const libMap = vfs.createDefaultMapFromNodeModules({ target: ts.ScriptTarget.ES2015 });
		const generatedMap = new Map<string, string>(
			output
				.filter((out): out is OutputChunk => out.type === 'chunk')
				.map<[string, string]>(chunk => [`/node_modules/@types/${chunk.name}/index.d.ts`, chunk.code])
		);
		return new Map<string, string>([...libMap, ...generatedMap]);
	}

	private _createGenerator(config: Config): OutputGenerator {
		switch (this._config.mode) {
			case 'spa': {
				return new SpaGenerator(config);
			}
			case 'html': {
				return new HtmlGenerator(config);
			}
			default: {
				throw new Error(`Generator '${this._config.mode as string}' not found`);
			}
		}
	}

	private async _createReferenceRootProgram(
		packagesDirsToPackageJson: Map<string, PackageJson>
	): Promise<ts.Program | undefined> {
		const rootConfigFileName = path.join(this._config.baseDir, 'tsconfig.json');
		if (await fileExists(rootConfigFileName)) {
			const rootConfig = parseConfig(rootConfigFileName);
			if (rootConfig.projectReferences?.length) {
				const readConfigFile = (p: string) => fs.readFileSync(p, 'utf-8');
				const configs = rootConfig.projectReferences.map(ref =>
					ts.readConfigFile(path.join(ref.path, 'tsconfig.json'), readConfigFile)
				);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				const firstExtends = configs[0].config.extends as string | undefined;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if (configs.some(conf => conf.config.extends !== firstExtends)) {
					throw new Error(
						'Package tsconfig files should all extend from the same base config that includes all compiler options'
					);
				}

				const resolvedExtends = mapOptional(firstExtends, ex =>
					path.resolve(rootConfig.projectReferences![0].path, ex)
				);

				const parsedConfigs = rootConfig.projectReferences.map(ref => ({
					configFilePath: ref.path,
					...parseConfig(path.join(ref.path, 'tsconfig.json'))
				}));

				const rootNames = parsedConfigs.flatMap(conf => conf.fileNames);

				const resolvedRootConfig = {
					extends: resolvedExtends,
					paths: Object.fromEntries(
						parsedConfigs.map(conf => {
							const pathName = path.basename(conf.configFilePath);
							const packageJson = packagesDirsToPackageJson.get(pathName)!;
							return [
								packageJson.name!,
								[Project.getEntryPointForPackageFolder(conf.configFilePath, packageJson, conf)]
							];
						})
					),
					include: rootNames
				};

				const parsedRootConfig = parseConfigObject(resolvedRootConfig, this._config.baseDir);
				return ts.createProgram({
					options: parsedRootConfig.options,
					configFileParsingDiagnostics: parsedRootConfig.errors,
					rootNames: rootNames,
					host: ts.createCompilerHost(parsedRootConfig.options)
				});
			}
		}

		return undefined;
	}
}
