import Generator from './Generator';
import { ReferenceNode } from '../../Common/reference';
import SPAGenerator from './SPAGenerator';
import HTMLGenerator from './HTMLGenerator';
import { partitionedFlatMap } from '../../Common/Tools/ArrayTools';
import { ReferenceNodeKind } from '../../Common/reference/ReferenceNodeKind';

export default class MonorepoGenerator extends Generator {
	async generate(data: ReferenceNode) {
		let generator;

		for (const pkg of data.children) {
			const subPackage = pkg.name;

			const config = {
				...this._config,
				...(this._config.packages && this._config.packages[subPackage] || {}),
				subPackage
			};

			switch (this._config.mode) {
				case 'spa': {
					generator = new SPAGenerator(config);
					break;
				}
				case 'html': {
					generator = new HTMLGenerator(config);
					break;
				}
				default: {
					throw new Error(`Generator '${this._config.mode}' not found`);
				}
			}

			process.stdout.write(`Building docs for package ${subPackage}...\n`);

			await generator.generate(data);

			process.stdout.write(`\rFinished building docs for package ${subPackage}\n`);
		}
	}

	protected _overrideTypeDocConfig(): Object {
		return {
			mode: 'modules'
		};
	}

	protected _startFilterReferenceStructure(node: ReferenceNode): ReferenceNode {
		// top level is project, below it are the modules
		node.children = Object.entries(partitionedFlatMap(
			node.children,
			child => {
				let name = child.name;
				if (name.charAt(0) === '"') {
					name = JSON.parse(name);
				}
				return name.split('/')[0];
			},
			child => child.children ? child.children.map(
				childOfChild => this._filterReferenceStructure(childOfChild, child, 1)!
			).filter(x => x) : []
		)).map(([name, children]) => ({
			id: -1,
			name,
			kind: ReferenceNodeKind.Package,
			kindString: 'Package',
			children,
			sources: [],
			flags: {},
			groups: []
		}));

		return node;
	}
}
