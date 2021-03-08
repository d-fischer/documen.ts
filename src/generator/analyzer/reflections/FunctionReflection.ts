import type * as ts from 'typescript';
import type { FunctionReferenceNode } from '../../../common/reference';
import { getReflectedCallSignatures } from '../util/functions';
import type { CallSignatureReflection } from './CallSignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class FunctionReflection extends SymbolBasedReflection {
	signatures!: CallSignatureReflection[];

	async processChildren(checker: ts.TypeChecker) {
		this.signatures = await getReflectedCallSignatures(checker, this._symbol, this);
	}

	serialize(): FunctionReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'function',
			signatures: this.signatures.map(sig => sig.serialize())
		};
	}
}
