import * as ts from 'typescript';
import type { ReferenceLocation, ReferenceNode } from '../../../common/reference';
import { DocComment } from '../DocComment';

export type ReflectionFlag = 'isPrivate' | 'isProtected' | 'isPublic' | 'isReadonly' | 'isAbstract' | 'isStatic' | 'isOptional' | 'isRest';

export abstract class Reflection {
	private static readonly _reflectionsById = new Map<number, Reflection>();
	private static readonly _packageNamesByReflectionId = new Map<number, string>();
	private static _nextReflectionId = 1;
	readonly id: number;
	comment?: DocComment;

	protected readonly _flags = new Set<ReflectionFlag>();

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

	/** @internal */
	static getPackageNameForReflectionId(id: number | undefined) {
		return id ? this._packageNamesByReflectionId.get(id) : undefined;
	}

	protected constructor() {
		this.id = this._registerReflection();
	}

	/** @internal */
	registerForPackageName(name: string) {
		Reflection._packageNamesByReflectionId.set(this.id, name);
	}

	/** @internal */
	abstract get declarations(): ts.Declaration[];

	serialize(): ReferenceNode {
		return {
			...this._baseSerialize(),
			debugKind: ts.SyntaxKind[this.declarations[0]?.kind]
		} as unknown as ReferenceNode;
	}

	abstract get name(): string;

	protected _baseSerialize(): Omit<ReferenceNode, 'kind'> & { kind: '__unhandled' } {
		const node = this.declarations[0] as ts.Declaration | undefined;
		const location = Reflection._getLocation(node);

		return {
			id: this.id,
			kind: '__unhandled',
			name: this.name,
			flags: Object.fromEntries([...this._flags].map(f => [f, true])),
			comment: this.comment?.serialize(),
			location
		};
	}

	protected _handleFlags(declaration?: ts.Declaration) {
		declaration ??= this.declarations[0] as ts.Declaration | undefined;

		if (!declaration) {
			return;
		}

		const modifiers = ts.getCombinedModifierFlags(declaration);

		/* eslint-disable no-bitwise */
		if (modifiers & ts.ModifierFlags.Private) {
			this._flags.add('isPrivate');
		}
		if (modifiers & ts.ModifierFlags.Protected) {
			this._flags.add('isProtected');
		}
		if (modifiers & ts.ModifierFlags.Public) {
			this._flags.add('isPublic');
		}
		if (modifiers & ts.ModifierFlags.Readonly) {
			this._flags.add('isReadonly');
		}
		if (modifiers & ts.ModifierFlags.Abstract) {
			this._flags.add('isAbstract');
		}
		if (modifiers & ts.ModifierFlags.Static) {
			this._flags.add('isStatic');
		}
		/* eslint-enable no-bitwise */

		// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
		if (!!(declaration as any).questionToken) {
			this._flags.add('isOptional');
		}
	}

	protected _processJsDoc(declaration?: ts.Declaration) {
		declaration ??= this.declarations[0] as ts.Declaration | undefined;
		if (!declaration) {
			return;
		}

		const sf = declaration.getSourceFile();
		const jsDocCommentRanges = ts.getLeadingCommentRanges(sf.text, declaration.pos)?.filter(range => sf.text.substr(range.pos, 3) === '/**');
		if (jsDocCommentRanges?.length) {
			const lastJsDocCommentRange = jsDocCommentRanges[jsDocCommentRanges.length - 1];
			const rawComment = sf.text.substring(lastJsDocCommentRange.pos, lastJsDocCommentRange.end);
			const comment = DocComment.parse(rawComment);

			comment.consumeTags(tag => tag.name === 'private', () => this._flags.add('isPrivate'));
			comment.consumeTags(tag => tag.name === 'protected', () => this._flags.add('isProtected'));
			comment.consumeTags(tag => tag.name === 'public', () => this._flags.add('isPublic'));

			if (comment.shortText || comment.text || comment.tags?.length) {
				this.comment = comment;
			}
		}
	}

	private static _getLocation(node?: ts.Node): ReferenceLocation | undefined {
		if (!node) {
			return undefined;
		}

		const sf = node.getSourceFile();
		const { fileName } = sf;
		const pos = node.getStart();
		const { character, line } = sf.getLineAndCharacterOfPosition(pos);

		return {
			fileName,
			line: line + 1,
			character
		};
	}

	private _registerReflection(): number {
		const id = Reflection._nextReflectionId++;
		Reflection._reflectionsById.set(id, this);
		return id;
	}
}
