import type { CallSignatureReferenceNode, TypeLiteralReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { Reflection } from './Reflection';
import type { SignatureReflection } from './SignatureReflection';

export class TypeLiteralReflection extends Reflection {
	readonly name = '__type';

	constructor(ctx: AnalyzeContext, private readonly _members?: Reflection[], private readonly _signatures?: SignatureReflection[]) {
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
			signatures: this._signatures?.map(sig => sig.serialize() as CallSignatureReferenceNode),
		};
	}
}
