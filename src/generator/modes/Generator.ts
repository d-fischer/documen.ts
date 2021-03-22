import type { TypeDocOptions } from 'typedoc';
import { Application, TSConfigReader } from 'typedoc';
import type { Config } from '../../common/config/Config';
import type Paths from '../../common/Paths';
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

	protected _overrideTypeDocConfig(): Partial<TypeDocOptions> {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected async _generateFsMap(data: SerializedProject, paths: Paths): Promise<Map<string, string>> {
		return new Map();
	}
}
