import fs from 'fs';
import path from 'path';
import type { TypeDocOptions } from 'typedoc';
import { Application, TSConfigReader } from 'typedoc';
import type { Config } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import { parseConfig } from '../../common/tools/ConfigTools';
import type { SerializedProject } from '../analyze';
import { analyzeMono } from '../analyze';

export default abstract class Generator {
	protected _config: Config;

	constructor(config: Config) {
		this._config = { ...config };
	}

	async createReferenceStructure() {
		const typeDoc = new Application();
		typeDoc.options.addReader(new TSConfigReader());

		// const entryPoint = this._getEntryPointForPackageFolder(this._config.baseDir);

		// TODO re-enable this properly
		return analyzeMono(['twitch'], this._config.baseDir);
	}


	abstract generate(data: SerializedProject, paths: Paths): Promise<void>;

	/** @protected */
	abstract _generatePackage(data: SerializedProject, paths: Paths, overrideConfig?: Partial<Config>): Promise<void>;

	/** @protected */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
	async _buildWebpack(data: SerializedProject, paths: Paths, fsMap: Map<string, string>, overrideConfig?: Partial<Config>) {
	}

	protected _getEntryPointForPackageFolder(dir: string) {
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
	}

	protected _overrideTypeDocConfig(): Partial<TypeDocOptions> {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected async _generateFsMap(data: SerializedProject, paths: Paths): Promise<Map<string, string>> {
		return new Map();
	}
}
