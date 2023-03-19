import { promises as fs } from 'fs';
import path from 'path';
import type { PackageJson } from 'type-fest';
import type { Config } from '../../common/config/Config';
import type Paths from '../../common/Paths';
import type { SerializedProject } from '../../common/reference';
import { Project } from '../analyzer/Project';

export type GeneratorProgressCallback = (progress: number, total: number) => void;

export default abstract class Generator {
	protected _config: Config;

	constructor(config: Config) {
		this._config = { ...config };
	}

	async createReferenceStructure() {
		const project = new Project(this._config);

		const packageJson = JSON.parse(
			await fs.readFile(path.join(this._config.baseDir, 'package.json'), 'utf8')
		) as PackageJson;
		await project.analyzeSinglePackage(packageJson);

		project.fixBrokenReferences();

		return project.serialize();
	}

	abstract generate(data: SerializedProject, paths: Paths): Promise<void>;

	/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function */
	async _buildBundle(
		data: SerializedProject,
		paths: Paths,
		fsMap: Map<string, string>,
		overrideConfig?: Partial<Config>
	) {}
	/* eslint-enable @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function */

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async _generateFsMap(data: SerializedProject, paths: Paths): Promise<Map<string, string>> {
		return new Map();
	}

	protected async withProgress(
		total: number,
		callback: GeneratorProgressCallback | undefined,
		worker: (callback: (amount?: number) => void) => Promise<void>
	) {
		let progress = 0;
		await worker((amount = 1) => {
			progress += amount;
			callback?.(progress, total);
		});
	}
}
