import { promises as fs } from 'fs';
import path from 'path';
import type { PackageJson } from 'type-fest';
import type { TypeDocOptions } from 'typedoc';
import type { Config } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import type { SerializedProject } from '../../common/reference';
import { Project } from '../analyzer/Project';

export default abstract class Generator {
	protected _config: Config;

	constructor(config: Config) {
		this._config = { ...config };
	}

	async createReferenceStructure() {
		const project = new Project(this._config.baseDir);

		const packageJson = JSON.parse(await fs.readFile(path.join(this._config.baseDir, 'package.json'), 'utf8')) as PackageJson;
		await project.analyzeSinglePackage(packageJson);

		return project.serialize();
	}


	abstract generate(data: SerializedProject, paths: Paths): Promise<void>;

	/** @protected */
	abstract _generatePackage(data: SerializedProject, paths: Paths, overrideConfig?: Partial<Config>): Promise<void>;

	/** @protected */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
	async _buildWebpack(data: SerializedProject, paths: Paths, fsMap: Map<string, string>, overrideConfig?: Partial<Config>) {
	}

	protected _overrideTypeDocConfig(): Partial<TypeDocOptions> {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected async _generateFsMap(data: SerializedProject, paths: Paths): Promise<Map<string, string>> {
		return new Map();
	}
}
