import * as TypeDoc from 'typedoc';
import * as path from 'path';
import { ReferenceNode } from '../../Common/Reference';
import Config from '../../Common/Config/Config';

export default abstract class Generator {
	protected _config: Config;

	constructor(config: Config) {
		this._config = { baseDir: process.cwd(), ...config };
	}

	createReferenceStructure(): ReferenceNode {
		// TODO get tsconfig from app
		const typeDoc = new TypeDoc.Application({
			mode: 'file',
			experimentalDecorators: true,
			module: 'commonjs',
			target: 'es5',
			lib: ['lib.es6.d.ts', 'lib.es2017.d.ts', 'lib.dom.d.ts'],
			logger: () => {
			} // tslint:disable-line:no-empty
		});
		const baseDir = this._config.baseDir;
		const files = typeDoc.expandInputFiles(this._config.inputDirs.map(dir => path.resolve(baseDir, dir)));
		const project = typeDoc.convert(files);
		const data = typeDoc.serializer.projectToObject(project);

		return this._filterReferenceStructure(data)!;
	}

	private _filterReferenceStructure(currentNode: ReferenceNode, parentNode?: ReferenceNode): ReferenceNode | null {
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
			result.children = currentNode.children.map(child => this._filterReferenceStructure(child, currentNode)!).filter(x => x);
		}

		return result;
	}

	abstract async generate(data: ReferenceNode): Promise<void>;
}