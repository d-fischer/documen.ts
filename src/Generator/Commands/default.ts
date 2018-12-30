// tslint:disable:no-console max-classes-per-file

import * as ansi from 'ansi-escapes';
import { Command, Options, command, option, params, ExpectedError } from 'clime';
import * as fs from 'fs-extra';
import * as path from 'path';
import Generator from '../Modes/Generator';
import WebpackError from '../Errors/WebpackError';
import WebpackBuildError from '../Errors/WebpackBuildError';
import SPAGenerator from '../Modes/SPAGenerator';
import HTMLGenerator from '../Modes/HTMLGenerator';
import RouterMode from '../../Common/HTMLRenderer/RouterMode';
import Config from '../../Common/Config/Config';
import { removeSlash } from '../../Common/Tools/StringTools';
import { getConfigValue } from '../../Common/Config/Util';

export class CLICommandOptions extends Options {
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

	@option({ description: 'index file' })
	indexFile: string;

	@option({ description: 'index title' })
	indexTitle: string;
}

@command()
export default class CLICommand extends Command {
	async execute(@params({ type: String, description: 'input directories' }) inputFolders: string[], options: CLICommandOptions) {
		process.env.NODE_ENV = 'production';

		const cwd = process.cwd();
		let configDir: string | null = null;

		if (options.configDir) {
			// check already made in validatior
			configDir = path.resolve(cwd, options.configDir);
		} else {
			const defaultConfigDir = path.resolve(cwd, 'docs');
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
			indexFile = path.join(cwd, 'README.md');
			if (!(await fs.pathExists(indexFile))) {
				throw new ExpectedError('there was neither a given index file nor a README.md in the root of the project');
			}
		}

		let generator: Generator;

		const generatorConfig: Config = {
			configDir,
			mode: options.mode || getConfigValue(importedConfig, 'mode') || 'html',
			routerMode: options.routerMode || getConfigValue(importedConfig, 'routerMode') || 'htmlSuffix',
			inputDirs: inputFolders.length ? inputFolders : getConfigValue(importedConfig, 'inputDirs', true),
			outputDir: options.outDir || getConfigValue(importedConfig, 'outputDir', true),
			baseUrl: removeSlash(options.baseUrl || getConfigValue(importedConfig, 'baseUrl', true)),
			baseDir: cwd,
			repoUser: getConfigValue(importedConfig, 'repoUser'),
			repoName: getConfigValue(importedConfig, 'repoName'),
			indexTitle: options.indexTitle || getConfigValue(importedConfig, 'indexTitle') || 'Welcome',
			indexFile: indexFile,
			categories: getConfigValue(importedConfig, 'categories') || undefined,
			webpackProgressCallback: (percentage, msg, moduleProgress) => {
				process.stdout.write(`${ansi.eraseLine}\rcompiling with webpack... ${percentage * 100}%`);
				if (moduleProgress) {
					process.stdout.write(` (${moduleProgress})`);
				}
			}
		};

		switch (options.mode) {
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
		const data = generator.createReferenceStructure();

		try {
			await generator.generate(data);
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
		}
	}
}
