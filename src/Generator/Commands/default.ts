/* eslint-disable no-console,max-classes-per-file */
import ansi from 'ansi-escapes';
import cartesianProduct from 'cartesian-product';
import { Command, command, ExpectedError, option, Options, params } from 'clime';
import { promises as fs, existsSync } from 'fs';
import path from 'path';
import tmp from 'tmp-promise';
import Config from '../../Common/config/Config';
import { getConfigValue } from '../../Common/config/Util';
import RouterMode from '../../Common/HTMLRenderer/RouterMode';
import Paths from '../../Common/Paths';
import { fileExists } from '../../Common/Tools/FileTools';
import { removeSlash } from '../../Common/Tools/StringTools';
import WebpackBuildError from '../Errors/WebpackBuildError';
import WebpackError from '../Errors/WebpackError';
import Generator from '../Modes/Generator';
import HtmlGenerator from '../Modes/HtmlGenerator';
import MonorepoGenerator from '../Modes/MonorepoGenerator';
import SpaGenerator from '../Modes/SpaGenerator';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class CLICommandOptions extends Options {
	@option({ description: 'base directory' })
	baseDir: string;

	@option({ flag: 'd', description: 'configuration directory', validator: (value: string) => existsSync(path.resolve(process.cwd(), value)) })
	configDir: string;

	@option({ flag: 'o', description: 'output directory' })
	outDir: string;

	@option({ flag: 'm', description: 'output mode', default: 'html' })
	mode: 'spa' | 'html';

	@option({ flag: 'r', description: 'render mode', default: 'htmlSuffix', validator: value => ['htmlSuffix', 'subDirectories', 'htaccess'].includes(value) })
	routerMode: RouterMode;

	@option({ flag: 'b', description: 'base URL', default: '' })
	baseUrl: string;

	@option({ description: 'set monorepo package root', default: '' })
	mono: string;

	@option({ description: 'repo user name', default: '' })
	repoUser: string;

	@option({ description: 'repo name', default: '' })
	repoName: string;

	@option({ description: 'git branch' })
	repoBranch: string;

	@option({ description: 'index file' })
	indexFile: string;

	@option({ description: 'index title' })
	indexTitle: string;
}

@command()
// eslint-disable-next-line @typescript-eslint/naming-convention
export default class CLICommand extends Command {
	async execute(@params({ type: String, description: 'input directories' }) inputFolders: string[], options: CLICommandOptions) {
		process.env.NODE_ENV = 'production';

		const baseDir = options.baseDir || process.cwd();
		let configDir: string | null = null;

		if (options.configDir) {
			// check already made in validatior
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
				const fileContents = await fs.readFile(configFile, 'utf-8');
				importedConfig = JSON.parse(fileContents) as Config;
			} catch (e) {
				throw new ExpectedError(`error reading ${configFile} as JSON: ${e.message}`);
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
				throw new ExpectedError('there was neither a given index file nor a README.md in the root of the project');
			}
		}

		let inputDirs = inputFolders;
		const monorepoRoot = options.mono || getConfigValue(importedConfig, 'monorepoRoot') || undefined;
		const ignoredPackages = getConfigValue(importedConfig, 'ignoredPackages') ?? undefined;

		if (!inputFolders.length) {
			const configInputDirs = getConfigValue(importedConfig, 'inputDirs', true);

			if (monorepoRoot) {
				const monorepoPackages = (await fs.readdir(path.join(baseDir, monorepoRoot)));
				inputDirs = cartesianProduct([monorepoPackages, configInputDirs]).map(([pkg, dir]) => path.join(baseDir, monorepoRoot, pkg, dir)).filter(inputDir => existsSync(inputDir));
			} else {
				inputDirs = configInputDirs;
			}
		}

		let needsManifest = false;
		let versionAware = false;

		const rootOutputDir = options.outDir || getConfigValue(importedConfig, 'outputDir', true);
		const mainBranchName = getConfigValue(importedConfig, 'mainBranchName') ?? 'master';
		const versionBranchPrefix = getConfigValue(importedConfig, 'versionBranchPrefix') ?? undefined;
		const versionFolder = getConfigValue(importedConfig, 'versionFolder') ?? undefined;

		let outputDir = rootOutputDir;
		let version: string | undefined;
		const rootUrl = removeSlash(options.baseUrl || getConfigValue(importedConfig, 'baseUrl', true) || '/');
		let baseUrl = rootUrl;

		if (versionBranchPrefix && versionFolder) {
			if (!options.repoBranch) {
				console.error('This project is version aware; please supply the branch name using the CLI option `--repo-branch`.');
				process.exit(1);
			}

			if (options.repoBranch.startsWith(versionBranchPrefix)) {
				version = options.repoBranch.substr(versionBranchPrefix.length);
				outputDir = path.join(rootOutputDir, versionFolder, version);
				baseUrl = path.posix.join(baseUrl, versionFolder, version);
			} else if (options.repoBranch !== mainBranchName) {
				console.error(`This project is version aware and can only build docs for the branch "${mainBranchName}" and branches starting with "${versionBranchPrefix}."`);
				process.exit(1);
			}
			needsManifest = true;
			versionAware = true;
		} else if (versionBranchPrefix || versionFolder) {
			console.error('Please either specify both the "versionBranchPrefix" and "versionFolder" options, or neither. Specifying only one of them is not supported.');
			process.exit(1);
		}

		const generatorConfig: Config = {
			configDir,
			mode: options.mode || getConfigValue(importedConfig, 'mode') || 'html',
			routerMode: options.routerMode || getConfigValue(importedConfig, 'routerMode') || 'htmlSuffix',
			inputDirs,
			outputDir,
			baseUrl,
			baseDir,
			monorepoRoot,
			mainPackage: getConfigValue(importedConfig, 'mainPackage') ?? undefined,
			mainBranchName,
			versionBranchPrefix,
			versionFolder,
			version,
			ignoredPackages,
			repoUser: options.repoUser || getConfigValue(importedConfig, 'repoUser'),
			repoName: options.repoName || getConfigValue(importedConfig, 'repoName'),
			repoBaseFolder: getConfigValue(importedConfig, 'repoBaseFolder'),
			repoBranch: options.repoBranch ?? 'master',
			indexTitle: options.indexTitle || getConfigValue(importedConfig, 'indexTitle') || 'Welcome',
			indexFile,
			categories: getConfigValue(importedConfig, 'categories') ?? undefined,
			packages: getConfigValue(importedConfig, 'packages') ?? undefined,
			shouldEnhance: true,
			webpackProgressCallback: (percentage, msg, moduleProgress) => {
				process.stdout.write(`${ansi.eraseLine}\rcompiling with webpack... ${percentage * 100}%`);
				if (moduleProgress) {
					process.stdout.write(` (${moduleProgress})`);
				}
			}
		};

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

		const { reference, sourceBasePath } = generator.createReferenceStructure();

		const tmpResult = await tmp.dir({ unsafeCleanup: true });
		const paths: Paths = {
			projectBase: baseDir,
			sourceBase: sourceBasePath,
			tmpDir: tmpResult.path,
			rootUrl
		};

		if (versionAware) {
			if (version) {
				console.log(`Cleaning up generated files for version ${version}`);
				await fs.rmdir(outputDir, { recursive: true });
				await fs.mkdir(outputDir, { recursive: true });
			} else {
				console.log(`Cleaning up generated files for branch ${mainBranchName}`);
				const [versionsRoot] = versionFolder!.split('/');
				const rootFolderContents = await fs.readdir(rootOutputDir);
				await Promise.all(
					rootFolderContents
						.filter(f => !f.startsWith('.') && f !== versionsRoot && f !== 'manifest.json')
						.map(async f => {
							const filePath = path.join(rootOutputDir, f);
							if ((await fs.lstat(filePath)).isDirectory()) {
								await fs.rmdir(filePath, { recursive: true });
							} else {
								await fs.unlink(filePath);
							}
						})
				);
			}
		}

		if (process.env.DOCTS_WRITE_JSON) {
			const jsonPath = path.join(baseDir, outputDir, 'data.json');
			const json = JSON.stringify(reference, null, 2);
			console.log(`Writing raw data to ${jsonPath}`);
			await fs.writeFile(jsonPath, json);
		}

		try {
			await generator.generate(reference, paths);
		} catch (e) {
			if (e instanceof WebpackError) {
				process.stderr.write('\nerror building with webpack:\n');
				console.error(e.originalError);
				process.exit(1);
			} else if (e instanceof WebpackBuildError) {
				process.stderr.write('\nerror building with webpack:\n');
				console.error(e.stats.toString());
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
			let manifest: any;
			try {
				const manifestJson = await fs.readFile(manifestPath, 'utf-8');
				console.log(`Read existing manifest from ${manifestPath}`);
				manifest = JSON.parse(manifestJson);
			} catch {
				console.log(`Manifest not found, creating new one at ${manifestPath}`)
				manifest = {};
			}
			const versionsSet = new Set<string>(manifest.versions ?? []);
			if (version) {
				versionsSet.add(version!);
			}
			manifest.versions = [...versionsSet].sort();
			manifest.rootUrl = rootUrl;

			console.log(`Writing manifest to ${manifestPath}`);
			await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
		}
	}
}
