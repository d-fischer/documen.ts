import type * as ts from 'typescript';
import type { ReferenceLocation, ReferenceNode } from '../../../common/reference';

export abstract class Reflection {
	private static readonly _reflectionsById = new Map<number, Reflection>();
	private static _nextReflectionId = 1;
	readonly id: number;

	static findIdAtPosition(fullPath: string, line: number, column: number): number | undefined {
		for (const [id, rs] of this._reflectionsById) {
			const declarations = rs.declarations;
			for (const declaration of declarations) {
				const declSf = declaration.getSourceFile();
				if (declSf.fileName !== fullPath) {
					continue;
				}
				const pos = declSf.getPositionOfLineAndCharacter(line, column);

				if (pos === declaration.getStart()) {
					return id;
				}
			}
		}

		return undefined;
	}

	constructor() {
		this.id = this._registerReflection();
	}

	/** @internal */
	static get reflectionsById() {
		return this._reflectionsById;
	}

	/** @internal */
	abstract get declarations(): ts.Declaration[];

	// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
	async processChildren(checker: ts.TypeChecker): Promise<void> {
	}

	serialize(): ReferenceNode {
		return this._baseSerialize() as unknown as ReferenceNode;
	}

	abstract get name(): string;

	protected _baseSerialize(): Omit<ReferenceNode, 'kind'> & { kind: '__unhandled' } {
		const node = this.declarations[0];
		const sf = node.getSourceFile();
		const { fileName } = sf;
		const pos = node.getStart();
		const { character, line } = sf.getLineAndCharacterOfPosition(pos);
		const location: ReferenceLocation = {
			fileName,
			line: line + 1,
			character
		};

		return {
			id: this.id,
			kind: '__unhandled',
			name: this.name,
			location
		};
	}

	private _registerReflection(): number {
		const id = Reflection._nextReflectionId++;
		Reflection._reflectionsById.set(id, this);
		return id;
	}
}
