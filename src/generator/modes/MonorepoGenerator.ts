import * as vfs from '@typescript/vfs';
import path from 'path';
import type { OutputChunk } from 'rollup';
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import * as ts from 'typescript';
import type { Config } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import type { ReferenceNode } from '../../common/reference';
import { partitionedFlatMap } from '../../common/tools/ArrayTools';
import Generator from './Generator';
import HtmlGenerator from './HtmlGenerator';
import SpaGenerator from './SpaGenerator';

export default class MonorepoGenerator extends Generator {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async _generatePackage(data: ReferenceNode, paths: Paths) {
		// stub
	}

	async generate(data: ReferenceNode, paths: Paths) {
		const generator = this._createGenerator(this._config);

		const fsMap = await this._generateFsMap(data, paths);
		await generator._buildWebpack(data, paths, fsMap);

		if (this._config.ignoredPackages) {
			process.stdout.write(`Not building docs for package(s): ${this._config.ignoredPackages.join(', ')}\n`);
		}

		for (const pkg of data.children!) {
			const subPackage = pkg.name;

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

	protected _transformTopReferenceNode(node: ReferenceNode): ReferenceNode {
		// top level is project, below it are the modules
		node.children = Object.entries(partitionedFlatMap(
			node.children!,
			child => {
				let name = child.name;
				if (name.startsWith('"')) {
					name = JSON.parse(name) as string;
				}
				return name.split('/')[0];
			},
			child => child.children ?? []
		)).map(([name, children]) => ({
			id: -1,
			name,
			kind: 'package',
			children,
			sources: []
		}));

		node.children.sort((a, b) => {
			if (a.name === this._config.mainPackage) {
				return -1;
			}

			if (b.name === this._config.mainPackage) {
				return 1;
			}

			return a.name.localeCompare(b.name);
		});

		return node;
	}

	protected async _generateFsMap(data: ReferenceNode, paths: Paths): Promise<Map<string, string>> {
		const bundle = await rollup({
			input: Object.fromEntries(data.children!.map(pkg => [pkg.name, path.join(paths.projectBase, this._config.monorepoRoot!, pkg.name, 'lib', 'index.d.ts')])),
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
