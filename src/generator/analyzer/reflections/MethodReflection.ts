import type * as ts from 'typescript';
import type { MethodReferenceNode } from '../../../common/reference';
import { getReflectedCallSignatures } from '../util/functions';
import type { CallSignatureReflection } from './CallSignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class MethodReflection extends SymbolBasedReflection {
	signatures!: CallSignatureReflection[];

	constructor(symbol: ts.Symbol, private readonly _parentSymbol?: ts.Symbol) {
		super(symbol);
	}

	async processChildren(checker: ts.TypeChecker) {
		this.signatures = await getReflectedCallSignatures(checker, this._symbol, this, this._parentSymbol);
	}

	serialize(): MethodReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'method',
			signatures: this.signatures.map(sig => sig.serialize())
		};
	}
}
