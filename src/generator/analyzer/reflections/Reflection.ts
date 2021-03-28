import path from 'path';
import * as ts from 'typescript';
import type { ReferenceLocation, ReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { DocComment } from '../DocComment';
import { SignatureReflection } from './SignatureReflection';

export type ReflectionFlag = 'isPrivate' | 'isProtected' | 'isPublic' | 'isReadonly' | 'isAbstract' | 'isStatic' | 'isOptional' | 'isRest';

export abstract class Reflection {
	readonly id: number;
	comment?: DocComment;
	parent?: Reflection;

	protected readonly _flags = new Set<ReflectionFlag>();

	protected constructor(private readonly _ctx: AnalyzeContext) {
		this.id = _ctx.project.registerReflection(this);
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

	protected _baseSerialize(locationReflection?: Reflection): Omit<ReferenceNode, 'kind'> & { kind: '__unhandled' } {
		locationReflection ??= this;
		const locationDeclaration = locationReflection.declarations[0] as ts.Declaration | undefined;
		const location = locationReflection._getLocation(locationDeclaration);

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

			comment.consumeTags(tag => tag.name === 'private', () => {
				this._flags.add('isPrivate');
				if (this instanceof SignatureReflection) {
					// console.log(`Passing private property from ${this.name} to parent ${ts.SyntaxKind[this.kind]}`);
					this.parent?._flags.add('isPrivate');
				}
			});
			comment.consumeTags(tag => tag.name === 'protected', () => {
				this._flags.add('isProtected');
				if (this instanceof SignatureReflection) {
					this.parent?._flags.add('isProtected');
				}
			});
			comment.consumeTags(tag => tag.name === 'public', () => {
				this._flags.add('isPublic');
				if (this instanceof SignatureReflection) {
					this.parent?._flags.add('isPublic');
				}
			});

			if (comment.shortText || comment.text || comment.tags?.length) {
				this.comment = comment;
			}
		}
	}

	private _getLocation(node: ts.Node): ReferenceLocation;
	private _getLocation(node?: ts.Node): ReferenceLocation | undefined;
	private _getLocation(node?: ts.Node): ReferenceLocation | undefined {
		if (!node) {
			return undefined;
		}

		const sf = node.getSourceFile();
		const { fileName } = sf;
		const relativeFileName = path.relative(this._ctx.project.baseDir, fileName);
		const pos = node.getStart();
		const { character, line } = sf.getLineAndCharacterOfPosition(pos);

		return {
			fileName: relativeFileName,
			line: line + 1,
			character
		};
	}
}
