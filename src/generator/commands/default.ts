/* eslint-disable no-console,max-classes-per-file */
import ansi from 'ansi-escapes';
import { Command, command, ExpectedError, metadata, option, Options } from 'clime';
import fs, { promises as fsp } from 'fs';
import path from 'path';
import tmp from 'tmp-promise';
import type { Config, Manifest } from '../../common/config/Config';
import { getConfigValue } from '../../common/config/Util';
import RouterMode from '../../common/htmlRenderer/RouterMode';
import type Paths from '../../common/Paths';
import { fileExists } from '../../common/tools/FileTools';
import { removeSlash } from '../../common/tools/StringTools';
import WebpackBuildError from '../errors/WebpackBuildError';
import WebpackError from '../errors/WebpackError';
import type Generator from '../modes/Generator';
import HtmlGenerator from '../modes/HtmlGenerator';
import MonorepoGenerator from '../modes/MonorepoGenerator';
import SpaGenerator from '../modes/SpaGenerator';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class CLICommandOptions extends Options {
	@option({ description: 'development mode; disable some optimizations in favor of speed' })
	dev?: boolean;

	@option({ description: 'use prettier on all HTML files; defaults to value of dev flag' })
	prettier?: boolean;

	@option({ description: 'base directory' })
	baseDir!: string;

	@option({
		flag: 'd',
		description: 'configuration directory',
		validator: (value: string) => fs.existsSync(path.resolve(process.cwd(), value))
	})
	configDir!: string;

	@option({ flag: 'o', description: 'output directory' })
	outDir!: string;

	@option({ flag: 'm', description: 'output mode', default: 'html' })
	mode!: 'spa' | 'html';

	@option({
		flag: 'r',
		description: 'render mode',
		default: 'htmlSuffix',
		validator: value => ['htmlSuffix', 'subDirectories', 'htaccess'].includes(value)
	})
	routerMode!: RouterMode;

	@option({ flag: 'b', description: 'base URL', default: '' })
	baseUrl!: string;

	@option({ description: 'set monorepo package root', default: '' })
	mono!: string;

	@option({ description: 'repo user name', default: '' })
	repoUser!: string;

	@option({ description: 'repo name', default: '' })
	repoName!: string;

	@option({ description: 'git branch' })
	repoBranch!: string;

	@option({ description: 'index file' })
	indexFile!: string;

	@option({ description: 'index title' })
	indexTitle!: string;
}

@command()
// eslint-disable-next-line @typescript-eslint/naming-convention
export default class CLICommand extends Command {
	@metadata
	async execute(options: CLICommandOptions) {
		process.env.NODE_ENV = 'production';

		const baseDir = options.baseDir || process.cwd();
		let configDir: string | null = null;

		if (options.configDir) {
			// check already made in validator
			configDir = path.resolve(baseDir, options.configDir);
		} else {
			const defaultConfigDir = path.resolve(baseDir, 'docs');
			if (await fileExists(defaultConfigDir)) {
				configDir = defaultConfigDir;
			}
		}

		let importedConfig: Config | null = null;
		let indexFile: string | null = null;

		if (configDir) {
			const configFile = path.join(configDir, 'config.json');

			if (!(await fileExists(configFile))) {
				throw new ExpectedError('configuration directory was found but there is no config.json file in it');
			}

			try {
				const fileContents = await fsp.readFile(configFile, 'utf-8');
				importedConfig = JSON.parse(fileContents) as Config;
			} catch (e: unknown) {
				throw new ExpectedError(`error reading ${configFile} as JSON: ${(e as Error).message}`);
			}

			indexFile = options.indexFile || getConfigValue(importedConfig, 'indexFile');
			if (indexFile) {
				indexFile = path.join(configDir, indexFile);
				if (!(await fileExists(indexFile))) {
					throw new ExpectedError('given index file does not exist in configuration directory');
				}
			}
		}

		if (!indexFile) {
			indexFile = path.join(baseDir, 'README.md');
			if (!(await fileExists(indexFile))) {
				throw new ExpectedError(
					'there was neither a given index file nor a README.md in the root of the project'
				);
			}
		}

		const monorepoRoot = (options.mono || getConfigValue(importedConfig, 'monorepoRoot')) ?? undefined;
		const ignoredPackages = getConfigValue(importedConfig, 'ignoredPackages') ?? undefined;

		const packageDirNames = monorepoRoot ? await fsp.readdir(path.join(baseDir, monorepoRoot)) : null;

		let needsManifest = false;
		let versionAware = false;

		const rootOutputDir = options.outDir || getConfigValue(importedConfig, 'outputDir', true);
		const mainBranchName = getConfigValue(importedConfig, 'mainBranchName') ?? 'master';
		const versionBranchPrefix = getConfigValue(importedConfig, 'versionBranchPrefix') ?? undefined;
		const versionFolder = getConfigValue(importedConfig, 'versionFolder') ?? undefined;

		let outputDir = rootOutputDir;
		let version: string | undefined = undefined;
		const rootUrl = removeSlash(options.baseUrl || getConfigValue(importedConfig, 'baseUrl', true) || '/');
		let baseUrl = rootUrl;

		if (versionBranchPrefix && versionFolder) {
			if (!options.repoBranch) {
				console.error(
					'This project is version aware; please supply the branch name using the CLI option `--repo-branch`.'
				);
				process.exit(1);
			}

			if (options.repoBranch.startsWith(versionBranchPrefix)) {
				version = options.repoBranch.substr(versionBranchPrefix.length);
				outputDir = path.join(rootOutputDir, versionFolder, version);
				baseUrl = path.posix.join(baseUrl, versionFolder, version);
			} else if (options.repoBranch !== mainBranchName) {
				console.error(
					`This project is version aware and can only build docs for the branch "${mainBranchName}" and branches starting with "${versionBranchPrefix}."`
				);
				process.exit(1);
			}
			needsManifest = true;
			versionAware = true;
		} else if (versionBranchPrefix || versionFolder) {
			console.error(
				'Please either specify both the "versionBranchPrefix" and "versionFolder" options, or neither. Specifying only one of them is not supported.'
			);
			process.exit(1);
		}

		const categories = getConfigValue(importedConfig, 'categories')?.filter(cat => {
			if (cat.indexFile) {
				return true;
			}

			console.warn(`Expected indexFile property for category ${cat.name}`);
			return false;
		});

		const generatorConfig: Config = {
			dev: options.dev ?? false,
			prettier: getConfigValue(importedConfig, 'prettier') ?? options.prettier ?? options.dev ?? false,
			configDir,
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			mode: options.mode || getConfigValue(importedConfig, 'mode') || 'html',
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			routerMode: options.routerMode || getConfigValue(importedConfig, 'routerMode') || 'htmlSuffix',
			outputDir,
			baseUrl,
			baseDir,
			packageScope: getConfigValue(importedConfig, 'packageScope')?.replace(/^@/, '') ?? undefined,
			monorepoRoot,
			packageDirNames,
			mainPackage: getConfigValue(importedConfig, 'mainPackage') ?? undefined,
			mainBranchName,
			versionBranchPrefix,
			versionFolder,
			version,
			ignoredPackages,
			title: getConfigValue(importedConfig, 'title'),
			repoUser: options.repoUser || getConfigValue(importedConfig, 'repoUser'),
			repoName: options.repoName || getConfigValue(importedConfig, 'repoName'),
			repoBaseFolder: getConfigValue(importedConfig, 'repoBaseFolder'),
			repoBranch: options.repoBranch || 'master',
			indexTitle: (options.indexTitle || getConfigValue(importedConfig, 'indexTitle')) ?? 'Welcome',
			indexFile,
			categories: categories ?? undefined,
			shouldEnhance: true,
			webpackProgressCallback: (percentage, msg, moduleProgress) => {
				process.stdout.write(`${ansi.eraseLine}\rcompiling with webpack... ${percentage * 100}%`);
				if (moduleProgress) {
					process.stdout.write(` (${moduleProgress})`);
				}
			}
		};

		// eslint-disable-next-line @typescript-eslint/init-declarations
		let generator: Generator;

		if (generatorConfig.monorepoRoot) {
			generator = new MonorepoGenerator(generatorConfig);
		} else {
			switch (generatorConfig.mode) {
				case 'spa': {
					generator = new SpaGenerator(generatorConfig);
					break;
				}
				case 'html': {
					generator = new HtmlGenerator(generatorConfig);
					break;
				}
				default: {
					throw new Error(`Generator '${options.mode}' not found`);
				}
			}
		}

		if (versionAware) {
			if (version) {
				console.log(`Cleaning up generated files for version ${version}`);
				await fsp.rmdir(outputDir, { recursive: true });
				await fsp.mkdir(outputDir, { recursive: true });
			} else {
				console.log(`Cleaning up generated files for branch ${mainBranchName}`);
				const [versionsRoot] = versionFolder!.split('/');
				const rootFolderContents = await fsp.readdir(rootOutputDir);
				await Promise.all(
					rootFolderContents
						.filter(f => !f.startsWith('.') && f !== versionsRoot && f !== 'manifest.json')
						.map(async f => {
							const filePath = path.join(rootOutputDir, f);
							if ((await fsp.lstat(filePath)).isDirectory()) {
								await fsp.rmdir(filePath, { recursive: true });
							} else {
								await fsp.unlink(filePath);
							}
						})
				);
			}
		}

		const reference = await generator.createReferenceStructure();

		if (process.env.DOCTS_WRITE_JSON) {
			const jsonPath = path.join(baseDir, outputDir, 'data.json');
			const json = JSON.stringify(reference, null, 2);
			console.log(`Writing raw data to ${jsonPath}`);
			await fsp.writeFile(jsonPath, json);

			if (process.env.DOCTS_WRITE_JSON === 'only') {
				return;
			}
		}

		const tmpResult = await tmp.dir({ unsafeCleanup: true });
		const paths: Paths = {
			projectBase: baseDir,
			tmpDir: tmpResult.path,
			rootUrl
		};

		try {
			await generator.generate(reference, paths);
		} catch (e) {
			if (e instanceof WebpackError) {
				process.stderr.write('\nerror building with webpack:\n');
				console.error(e.originalError);
				process.exit(1);
			} else if (e instanceof WebpackBuildError) {
				process.stderr.write('\nerror building with webpack:\n');
				console.error(e.stats?.toString());
				process.exit(1);
			} else {
				process.stderr.write('\nerror building the documentation:\n');
				console.error(e);
				process.exit(1);
			}
		} finally {
			await tmpResult.cleanup();
		}

		if (needsManifest) {
			const manifestPath = path.join(baseDir, rootOutputDir, 'manifest.json');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let manifest: Partial<Manifest> = {};
			try {
				const manifestJson = await fsp.readFile(manifestPath, 'utf-8');
				console.log(`Read existing manifest from ${manifestPath}`);
				manifest = JSON.parse(manifestJson) as Manifest;
			} catch {
				console.log(`Manifest not found, creating new one at ${manifestPath}`);
			}
			const versionsSet = new Set<string>(manifest.versions ?? []);
			if (version) {
				versionsSet.add(version);
			}
			// eslint-disable-next-line @typescript-eslint/require-array-sort-compare
			manifest.versions = [...versionsSet].sort();
			manifest.rootUrl = rootUrl;

			console.log(`Writing manifest to ${manifestPath}`);
			await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
		}
	}
}
