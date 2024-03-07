import ts from 'typescript';
import type { CallSignatureReferenceNode, TypeLiteralReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createReflection } from '../createReflection';
import { resolvePromiseArray } from '../util/promises';
import { Reflection } from './Reflection';
import { SignatureReflection } from './SignatureReflection';

export class TypeLiteralReflection extends Reflection {
	readonly name = '__type';

	private _members?: Reflection[];
	private _signatures?: SignatureReflection[];

	static async fromTsType(ctx: AnalyzeContext, type: ts.Type) {
		const that = new TypeLiteralReflection(ctx);

		that._members = await resolvePromiseArray(
			ctx.checker.getPropertiesOfType(type).map(async prop => await createReflection(ctx, prop, that))
		);
		that._signatures = await resolvePromiseArray(
			type
				.getCallSignatures()
				.map(async sig => await SignatureReflection.fromTsSignature(ctx, ts.SyntaxKind.CallSignature, sig))
		);

		return that;
	}

	static fromParts(ctx: AnalyzeContext, members?: Reflection[], signatures?: SignatureReflection[]) {
		const that = new TypeLiteralReflection(ctx);

		that._members = members;
		that._signatures = signatures;

		return that;
	}

	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(ctx: AnalyzeContext) {
		super(ctx);
	}

	get declarations() {
		return [];
	}

	serialize(): TypeLiteralReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'typeLiteral',
			members: this._members?.map(mem => mem.serialize()) ?? [],
			signatures: this._signatures?.map(sig => sig.serialize() as CallSignatureReferenceNode)
		};
	}
}
