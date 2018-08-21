// tslint:disable:no-console max-classes-per-file

import { Command, Options, command, option, params } from 'clime';
import Generator, { GeneratorOptions } from '../Modes/Generator';
import WebpackError from '../Errors/WebpackError';
import WebpackBuildError from '../Errors/WebpackBuildError';
import * as ansi from 'ansi-escapes';
import SPAGenerator from '../Modes/SPAGenerator';
import HTMLGenerator from '../Modes/HTMLGenerator';
import RouterMode from '../../Common/HTMLRenderer/RouterMode';

export class CLICommandOptions extends Options {
	@option({ flag: 'o', description: 'output directory', required: true })
	outDir: string;

	@option({ flag: 'm', description: 'output mode', default: 'html' })
	mode: 'spa' | 'html';

	@option({ flag: 'r', description: 'render mode', default: 'htmlSuffix' })
	routerMode: RouterMode;

	@option({ flag: 'b', description: 'base URL', default: '' })
	baseUrl: string;
}

@command()
export default class CLICommand extends Command {
	async execute(@params({ type: String, description: 'input directories' }) inputFolders: string[], options: CLICommandOptions) {
		process.env.NODE_ENV = 'production';

		const cwd = process.cwd();

		let generator: Generator;

		const generatorOptions: GeneratorOptions = {
			inputDirs: inputFolders,
			outDir: options.outDir,
			baseUrl: options.baseUrl,
			baseDir: cwd,
			webpackProgressCallback: (percentage, msg, moduleProgress) => {
				process.stdout.write(`${ansi.eraseLine}\rcompiling with webpack... ${percentage * 100}%`);
				if (moduleProgress) {
					process.stdout.write(` (${moduleProgress})`);
				}
			},
			routerMode: options.routerMode
		};

		switch (options.mode) {
			case 'spa': {
				generator = new SPAGenerator(generatorOptions);
				break;
			}
			case 'html': {
				generator = new HTMLGenerator(generatorOptions);
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
				throw e;
			}
		}
	}
}
