import type { TypeDocAndTSOptions } from 'typedoc';
import { Application, TSConfigReader } from 'typedoc';
import path from 'path';
import type Paths from '../../Common/Paths';
import type { ReferenceNode } from '../../Common/reference';
import type { Config } from '../../Common/config/Config';

export default abstract class Generator {
	protected _config: Config;

	constructor(config: Config) {
		this._config = { ...config };
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
		/* eslint-disable @typescript-eslint/no-unsafe-member-access */
		if (sourcePlugin.basePath.basePaths.length !== 1) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/restrict-template-expressions
			throw new Error(`This project does not have exactly one base path (${sourcePlugin.basePath.basePaths.join(', ') || 'none'}), please file an issue`);
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const sourceBasePath: string = sourcePlugin.basePath.basePaths[0];
		/* eslint-enable @typescript-eslint/no-unsafe-member-access */

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

	protected _overrideTypeDocConfig(): Partial<TypeDocAndTSOptions> {
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
