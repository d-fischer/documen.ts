import * as ts from 'typescript';
import type { ReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { DocComment } from '../DocComment';
import { SignatureReflection } from './SignatureReflection';

export type ReflectionFlag = 'isPrivate' | 'isProtected' | 'isPublic' | 'isReadonly' | 'isAbstract' | 'isStatic' | 'isOptional' | 'isRest';

export abstract class Reflection {
	readonly id: number;

	comment?: DocComment;
	parent?: Reflection;

	readonly isInheritable: boolean = false;

	readonly flags = new Set<ReflectionFlag>();

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

	protected _baseSerialize(locationNode?: ts.Node): Omit<ReferenceNode, 'kind'> & { kind: '__unhandled' } {
		locationNode ??= this.declarations[0] as ts.Declaration | undefined;
		const location = this._ctx.project.getNodeLocation(locationNode);

		return {
			id: this.id,
			kind: '__unhandled',
			name: this.name,
			flags: Object.fromEntries([...this.flags].map(f => [f, true])),
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
			this.flags.add('isPrivate');
		}
		if (modifiers & ts.ModifierFlags.Protected) {
			this.flags.add('isProtected');
		}
		if (modifiers & ts.ModifierFlags.Public) {
			this.flags.add('isPublic');
		}
		if (modifiers & ts.ModifierFlags.Readonly) {
			this.flags.add('isReadonly');
		}
		if (modifiers & ts.ModifierFlags.Abstract) {
			this.flags.add('isAbstract');
		}
		if (this._ctx.staticContext || modifiers & ts.ModifierFlags.Static) {
			this.flags.add('isStatic');
		}
		/* eslint-enable no-bitwise */

		// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
		if (!!(declaration as any).questionToken) {
			this.flags.add('isOptional');
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
				this.flags.add('isPrivate');
				if (this instanceof SignatureReflection) {
					// console.log(`Passing private property from ${this.name} to parent ${ts.SyntaxKind[this.kind]}`);
					this.parent?.flags.add('isPrivate');
				}
			});
			comment.consumeTags(tag => tag.name === 'protected', () => {
				this.flags.add('isProtected');
				if (this instanceof SignatureReflection) {
					this.parent?.flags.add('isProtected');
				}
			});
			comment.consumeTags(tag => tag.name === 'public', () => {
				this.flags.add('isPublic');
				if (this instanceof SignatureReflection) {
					this.parent?.flags.add('isPublic');
				}
			});

			if (comment.shortText || comment.text || comment.tags?.length) {
				this.comment = comment;
			}
		}
	}
}
