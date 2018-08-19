#!/usr/bin/env node
// tslint:disable:no-console

import { argv } from 'yargs';
import Generator from './Modes/Generator';
import WebpackError from './Errors/WebpackError';
import WebpackBuildError from './Errors/WebpackBuildError';
import * as ansi from 'ansi-escapes';
import SPAGenerator from './Modes/SPAGenerator';

if (!argv.outDir) {
	console.error('Please specify an --outDir={path} parameter');
	process.exit(1);
}
if (!argv.mode || !['spa', 'html'].includes(argv.mode)) {
	console.error('Please specify a --mode=spa|html parameter');
	process.exit(1);
}
if (!argv._.length) {
	console.error('Please specify at least one input directory');
	process.exit(1);
}

process.env.NODE_ENV = 'production';

const cwd = process.cwd();

let generator: Generator;

switch (argv.mode) {
	case 'spa': {
		generator = new SPAGenerator({
			inputFolders: argv._,
			baseDir: cwd,
			webpackProgressCallback: (percentage, msg, moduleProgress) => {
				process.stdout.write(`${ansi.eraseLine}\rcompiling with webpack... ${percentage * 100}%`);
				if (moduleProgress) {
					process.stdout.write(` (${moduleProgress})`);
				}
			}
		});
		break;
	}
	case 'html': {
		// return new HTMLGenerator(options);
		throw new Error('HTML generator not implemented yet');
	}
	default: {
		throw new Error(`Generator '${argv.mode} not found`);
	}
}
const data = generator.createReferenceStructure();

// tslint:disable-next-line:no-floating-promises
(async () => {
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
})();


