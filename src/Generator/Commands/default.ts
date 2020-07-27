/* eslint-disable no-console,max-classes-per-file */
import ansi from 'ansi-escapes';
import cartesianProduct from 'cartesian-product';
import { Command, command, ExpectedError, option, Options, params } from 'clime';
import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp-promise';
import Config from '../../Common/config/Config';
import { getConfigValue } from '../../Common/config/Util';
import RouterMode from '../../Common/HTMLRenderer/RouterMode';
import { removeSlash } from '../../Common/Tools/StringTools';
import WebpackBuildError from '../Errors/WebpackBuildError';
import WebpackError from '../Errors/WebpackError';
import Generator from '../Modes/Generator';
import HTMLGenerator from '../Modes/HTMLGenerator';
import MonorepoGenerator from '../Modes/MonorepoGenerator';
import SPAGenerator from '../Modes/SPAGenerator';

export class CLICommandOptions extends Options {
	@option({ description: 'base directory' })
	baseDir: string;

	@option({ flag: 'd', description: 'configuration directory', validator: (value: string) => fs.pathExistsSync(path.resolve(process.cwd(), value)) })
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

	@option({ description: 'git branch', default: 'master' })
	repoBranch: string;

	@option({ description: 'index file' })
	indexFile: string;

	@option({ description: 'index title' })
	indexTitle: string;
}

@command()
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
			if (await fs.pathExists(defaultConfigDir)) {
				configDir = defaultConfigDir;
			}
		}

		let importedConfig: Config | null = null;
		let indexFile: string | null = null;

		if (configDir) {
			const configFile = path.join(configDir, 'config.json');

			if (!(await fs.pathExists(configFile))) {
				throw new ExpectedError('configuration directory was found but there is no config.json file in it');
			}

			try {
				importedConfig = await fs.readJSON(configFile) as Config;
			} catch (e) {
				throw new ExpectedError(`error reading ${configFile} as JSON: ${e.message}`);
			}

			indexFile = options.indexFile || getConfigValue(importedConfig, 'indexFile');
			if (indexFile) {
				indexFile = path.join(configDir, indexFile);
				if (!(await fs.pathExists(indexFile))) {
					throw new ExpectedError('given index file does not exist in configuration directory');
				}
			}
		}

		if (!indexFile) {
			indexFile = path.join(baseDir, 'README.md');
			if (!(await fs.pathExists(indexFile))) {
				throw new ExpectedError('there was neither a given index file nor a README.md in the root of the project');
			}
		}

		let generator: Generator;

		let inputDirs = inputFolders;
		const monorepoRoot = options.mono || getConfigValue(importedConfig, 'monorepoRoot') || undefined;
		const ignoredPackages = getConfigValue(importedConfig, 'ignoredPackages') || [];

		if (!inputFolders.length) {
			const configInputDirs = getConfigValue(importedConfig, 'inputDirs', true);

			if (monorepoRoot) {
				const monorepoPackages = (await fs.readdir(path.join(baseDir, monorepoRoot))).filter(pkg => !ignoredPackages.includes(pkg));
				inputDirs = cartesianProduct([monorepoPackages, configInputDirs]).map(([pkg, dir]) => path.join(baseDir, monorepoRoot, pkg, dir)).filter(inputDir => fs.pathExistsSync(inputDir));
			} else {
				inputDirs = configInputDirs;
			}
		}

		const generatorConfig: Config = {
			configDir,
			mode: options.mode || getConfigValue(importedConfig, 'mode') || 'html',
			routerMode: options.routerMode || getConfigValue(importedConfig, 'routerMode') || 'htmlSuffix',
			inputDirs,
			outputDir: options.outDir || getConfigValue(importedConfig, 'outputDir', true),
			baseUrl: removeSlash(options.baseUrl || getConfigValue(importedConfig, 'baseUrl', true) || '/'),
			baseDir: baseDir,
			monorepoRoot,
			ignoredPackages,
			repoUser: options.repoUser || getConfigValue(importedConfig, 'repoUser'),
			repoName: options.repoName || getConfigValue(importedConfig, 'repoName'),
			repoBaseFolder: getConfigValue(importedConfig, 'repoBaseFolder'),
			repoBranch: options.repoBranch,
			indexTitle: options.indexTitle || getConfigValue(importedConfig, 'indexTitle') || 'Welcome',
			indexFile,
			categories: getConfigValue(importedConfig, 'categories') || undefined,
			packages: getConfigValue(importedConfig, 'packages') || undefined,
			shouldEnhance: true,
			webpackProgressCallback: (percentage, msg, moduleProgress) => {
				process.stdout.write(`${ansi.eraseLine}\rcompiling with webpack... ${percentage * 100}%`);
				if (moduleProgress) {
					process.stdout.write(` (${moduleProgress})`);
				}
			}
		};

		if (generatorConfig.monorepoRoot) {
			generator = new MonorepoGenerator(generatorConfig);
		} else {
			switch (generatorConfig.mode) {
				case 'spa': {
					generator = new SPAGenerator(generatorConfig);
					break;
				}
				case 'html': {
					generator = new HTMLGenerator(generatorConfig);
					break;
				}
				default: {
					throw new Error(`Generator '${options.mode}' not found`);
				}
			}
		}

		const { reference, sourceBasePath } = generator.createReferenceStructure();

		if (process.env.DOCTS_WRITE_JSON) {
			const jsonPath = path.join(generatorConfig.outputDir, 'data.json');
			await fs.writeJSON(jsonPath, reference, { spaces: 2 });
		}

		const tmpResult = await tmp.dir({ unsafeCleanup: true });
		try {
			await generator.generate(reference, {
				projectBase: baseDir,
				sourceBase: sourceBasePath,
				tmpDir: tmpResult.path
			});
			process.exit(0);
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
	}
}
