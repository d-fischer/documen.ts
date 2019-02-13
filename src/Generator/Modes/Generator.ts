import * as TypeDoc from 'typedoc';
import * as path from 'path';
import { ReferenceNode } from '../../Common/Reference';
import Config from '../../Common/Config/Config';

export default abstract class Generator {
	protected _config: Config;

	constructor(config: Config) {
		this._config = { baseDir: process.cwd(), ...config };
	}

	createReferenceStructure() {
		const baseDir = this._config.baseDir;
		const typeDoc = new TypeDoc.Application({
			mode: 'file',
			tsconfig: path.join(baseDir, 'tsconfig.json'),
			logger: () => {
			} // tslint:disable-line:no-empty
		});
		const files = typeDoc.expandInputFiles(this._config.inputDirs.map(dir => path.resolve(baseDir, dir)));
		const project = typeDoc.convert(files);
		if (!project) {
			throw new Error('Error parsing the project structure');
		}
		const data = typeDoc.serializer.projectToObject(project);

		return this._filterReferenceStructure(data)!;
	}

	private _filterReferenceStructure(currentNode: ReferenceNode, parentNode?: ReferenceNode, level: number = 0): ReferenceNode | null {
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

	abstract async generate(data: ReferenceNode): Promise<void>;
}
