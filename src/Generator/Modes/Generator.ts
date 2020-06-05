import { Application, TSConfigReader } from 'typedoc';
import path from 'path';
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
			logger: () => {
			},
			...this._overrideTypeDocConfig()
		})
		const files = typeDoc.expandInputFiles(this._config.inputDirs.map(dir => path.resolve(baseDir, dir)));
		const project = typeDoc.convert(files);
		if (!project) {
			throw new Error('Error parsing the project structure');
		}
		const data = typeDoc.serializer.projectToObject(project);

		// needs to be ignored because we go through a lot of private stuff
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const sourcePlugin: any = typeDoc.converter.getComponent('source');
		if (sourcePlugin.basePath.basePaths.length !== 1) {
			throw new Error(`This project does not have exactly one base path (${sourcePlugin.basePath.basePaths.join(', ') || 'none'}), please file an issue`);
		}
		const sourceBasePath: string = sourcePlugin.basePath.basePaths[0];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const reference = this._startFilterReferenceStructure(data as any);

		return {
			sourceBasePath,
			reference
		};
	}

	abstract async generate(data: ReferenceNode, projectBase: string, sourceBase: string): Promise<void>;

	protected _overrideTypeDocConfig(): Object {
		return {};
	}

	protected _startFilterReferenceStructure(node: ReferenceNode): ReferenceNode {
		return this._filterReferenceStructure(node)!;
	}

	protected _filterReferenceStructure(currentNode: ReferenceNode, parentNode?: ReferenceNode, level: number = 0): ReferenceNode | null {
		try {
			if (currentNode.flags.isPrivate) {
				return null;
			}

			const parentTags = (parentNode && parentNode.comment && parentNode.comment.tags) || [];
			const parentTagKeys = parentTags.map(tag => tag.tag);

			if (currentNode.flags.isProtected && parentTagKeys.includes('hideprotected')) {
				return null;
			}

			if (currentNode.inheritedFrom && !parentTagKeys.includes('inheritdoc')) {
				return null;
			}

			const result = { ...currentNode };

			if (currentNode.children) {
				result.children = currentNode.children.map(child => this._filterReferenceStructure(child, currentNode, level + 1)!).filter(x => x);
			}

			return result;
		} catch (e) {
			throw new Error(`Error transforming reference structure at id ${currentNode.id}: ${e.message}`);
		}
	}
}
