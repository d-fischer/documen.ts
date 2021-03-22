import * as vfs from '@typescript/vfs';
import path from 'path';
import type { OutputChunk } from 'rollup';
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import * as ts from 'typescript';
import type { Config } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import type { SerializedProject } from '../analyze';
import { analyzeMono } from '../analyze';
import Generator from './Generator';
import HtmlGenerator from './HtmlGenerator';
import SpaGenerator from './SpaGenerator';

export default class MonorepoGenerator extends Generator {
	async createReferenceStructure(): Promise<{ reference: SerializedProject; sourceBasePath: string }> {
		const analyzed = await analyzeMono(['twitch-common', 'twitch']);

		return {
			reference: analyzed,
			// FIXME
			sourceBasePath: '/'
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async _generatePackage(data: SerializedProject, paths: Paths) {
		// stub
	}

	async generate(data: SerializedProject, paths: Paths) {
		const generator = this._createGenerator(this._config);

		const fsMap = await this._generateFsMap(data, paths);
		await generator._buildWebpack(data, paths, fsMap);

		if (this._config.ignoredPackages) {
			process.stdout.write(`Not building docs for package(s): ${this._config.ignoredPackages.join(', ')}\n`);
		}

		for (const pkg of data.packages) {
			const subPackage = pkg.packageName;

			if (this._config.ignoredPackages?.includes(subPackage)) {
				continue;
			}

			const config = {
				...(this._config.packages?.[subPackage] ?? {}),
				subPackage
			};

			process.stdout.write(`Building docs for package ${subPackage}...\n`);

			await generator._generatePackage(data, paths, config);

			process.stdout.write(`\rFinished building docs for package ${subPackage}\n`);
		}
	}

	protected async _generateFsMap(data: SerializedProject, paths: Paths): Promise<Map<string, string>> {
		const bundle = await rollup({
			input: Object.fromEntries(data.packages.map(pkg => [pkg.packageName, path.join(paths.projectBase, this._config.monorepoRoot!, pkg.packageName, 'lib', 'index.d.ts')])),
			plugins: [dts()]
		});
		const { output } = await bundle.generate({ format: 'es' });

		const libMap = vfs.createDefaultMapFromNodeModules({ target: ts.ScriptTarget.ES2015 });
		const generatedMap = new Map<string, string>(output.filter((out): out is OutputChunk => out.type === 'chunk').map<[string, string]>(chunk => [`/node_modules/@types/${chunk.name}/index.d.ts`, chunk.code]));
		return new Map<string, string>([...libMap, ...generatedMap]);
	}

	private _createGenerator(config: Config): Generator {
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
}
