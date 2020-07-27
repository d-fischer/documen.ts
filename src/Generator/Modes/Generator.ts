import { Application, TSConfigReader } from 'typedoc';
import path from 'path';
import Paths from '../../Common/Paths';
import { ReferenceNode } from '../../Common/reference';
import Config from '../../Common/config/Config';

export default abstract class Generator {
	protected _config: Config;

	constructor(config: Config) {
		this._config = { baseDir: process.cwd(), ...config };
	}

	createReferenceStructure() {
		const baseDir = this._config.baseDir;
		const typeDoc = new Application();
		typeDoc.options.addReader(new TSConfigReader());
		typeDoc.bootstrap({
			mode: 'file',
			...this._overrideTypeDocConfig()
		});
		const files = typeDoc.expandInputFiles(this._config.inputDirs.map(dir => path.resolve(baseDir, dir)));
		const project = typeDoc.convert(files);
		if (!project) {
			throw new Error('Error parsing the project structure');
		}
		const data = typeDoc.serializer.projectToObject(project) as unknown as ReferenceNode;

		// needs to be ignored because we go through a lot of private stuff
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const sourcePlugin: any = typeDoc.converter.getComponent('source');
		if (sourcePlugin.basePath.basePaths.length !== 1) {
			throw new Error(`This project does not have exactly one base path (${sourcePlugin.basePath.basePaths.join(', ') || 'none'}), please file an issue`);
		}
		const sourceBasePath: string = sourcePlugin.basePath.basePaths[0];

		const reference = this._transformTopReferenceNode(data);

		return {
			sourceBasePath,
			reference
		};
	}

	abstract async generate(data: ReferenceNode, paths: Paths): Promise<void>;

	/** @protected */
	abstract async _generatePackage(data: ReferenceNode, paths: Paths, overrideConfig?: Partial<Config>): Promise<void>;

	/** @protected */
	async _buildWebpack(data: ReferenceNode, paths: Paths, fsMap: Map<string, string>, overrideConfig: Partial<Config> = {}) {
	}

	protected _overrideTypeDocConfig(): Object {
		return {};
	}

	protected _transformTopReferenceNode(node: ReferenceNode): ReferenceNode {
		return node;
	}

	protected async _generateFsMap(data: ReferenceNode, paths: Paths): Promise<Map<string, string>> {
		return new Map();
	}
}
