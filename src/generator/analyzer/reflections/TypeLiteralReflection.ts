import type { CallSignatureReferenceNode, TypeLiteralReferenceNode } from '../../../common/reference';
import { Reflection } from './Reflection';
import type { SignatureReflection } from './SignatureReflection';

export class TypeLiteralReflection extends Reflection {
	readonly name = '__type';

	constructor(private readonly _signatures?: SignatureReflection[]) {
		super();
	}

	get declarations() {
		return [];
	}

	serialize(): TypeLiteralReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'typeLiteral',
			signatures: this._signatures?.map(sig => sig.serialize() as CallSignatureReferenceNode),
		};
	}
}
