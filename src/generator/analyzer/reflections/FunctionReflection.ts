import type * as ts from 'typescript';
import type { FunctionReferenceNode, SignatureReferenceNode } from '../../../common/reference';
import { getReflectedCallSignatures } from '../util/functions';
import type { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class FunctionReflection extends SymbolBasedReflection {
	signatures!: SignatureReflection[];

	async processChildren(checker: ts.TypeChecker) {
		this.signatures = await getReflectedCallSignatures(checker, this._symbol, this);
	}

	serialize(): FunctionReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'function',
			signatures: this.signatures.map(sig => sig.serialize() as SignatureReferenceNode)
		};
	}
}
