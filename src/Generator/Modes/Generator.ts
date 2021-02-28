import fs from 'fs';
import path from 'path';
import type { TypeDocOptions } from 'typedoc';
import { Application, TSConfigReader } from 'typedoc';
import type { Config } from '../../Common/config/Config';
import type Paths from '../../Common/Paths';
import type { ReferenceNode } from '../../Common/reference';
import { parseConfig } from '../../Common/Tools/ConfigTools';

export default abstract class Generator {
	protected _config: Config;

	constructor(config: Config) {
		this._config = { ...config };
	}

	createReferenceStructure() {
		const typeDoc = new Application();
		typeDoc.options.addReader(new TSConfigReader());
		const files = this._config.inputDirs.map(dir => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
			const tsconfig = parseConfig(path.join(dir, 'tsconfig.json'));

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
			let mainJsFile: string = pkg.main;
			const lastPathPart = mainJsFile.split(path.delimiter).reverse()[0];
			if (!/\.m?js]$/.test(lastPathPart)) {
				mainJsFile = path.join(mainJsFile, 'index.js');
			}

			const fullOutPath = path.join(dir, mainJsFile);
			const innerOutPath = path.relative(tsconfig.options.outDir!, fullOutPath);
			return path.join(tsconfig.options.rootDir!, innerOutPath.replace(/\.m?js$/, '.ts'));
		});
		// const files = typeDoc.expandInputFiles(this._config.inputDirs.map(dir => path.resolve(baseDir, dir)));
		typeDoc.bootstrap({
			entryPoints: files,
			...this._overrideTypeDocConfig()
		});
		const project = typeDoc.convert();
		if (!project) {
			throw new Error('Error parsing the project structure');
		}
		const data = typeDoc.serializer.projectToObject(project) as unknown as ReferenceNode;

		// needs to be ignored because we go through a lot of private stuff
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const sourcePlugin: any = typeDoc.converter.getComponent('source');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		const sourceBasePath: string = sourcePlugin.basePath;

		const reference = this._transformTopReferenceNode(data);

		return {
			sourceBasePath,
			reference
		};
	}

	abstract generate(data: ReferenceNode, paths: Paths): Promise<void>;

	/** @protected */
	abstract _generatePackage(data: ReferenceNode, paths: Paths, overrideConfig?: Partial<Config>): Promise<void>;

	/** @protected */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
	async _buildWebpack(data: ReferenceNode, paths: Paths, fsMap: Map<string, string>, overrideConfig?: Partial<Config>) {
	}

	protected _overrideTypeDocConfig(): Partial<TypeDocOptions> {
		return {};
	}

	protected _transformTopReferenceNode(node: ReferenceNode): ReferenceNode {
		return node;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected async _generateFsMap(data: ReferenceNode, paths: Paths): Promise<Map<string, string>> {
		return new Map();
	}
}
