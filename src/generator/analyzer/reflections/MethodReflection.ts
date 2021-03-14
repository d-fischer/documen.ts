import type * as ts from 'typescript';
import type { MethodReferenceNode, SignatureReferenceNode } from '../../../common/reference';
import { getReflectedCallSignatures } from '../util/functions';
import type { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class MethodReflection extends SymbolBasedReflection {
	signatures!: SignatureReflection[];

	constructor(symbol: ts.Symbol, private readonly _parentSymbol?: ts.Symbol) {
		super(symbol);

		this._handleFlags(symbol.declarations[0]);
	}

	async processChildren(checker: ts.TypeChecker) {
		this.signatures = await getReflectedCallSignatures(checker, this._symbol, this, this._parentSymbol);
	}

	serialize(): MethodReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'method',
			signatures: this.signatures.map(sig => sig.serialize() as SignatureReferenceNode)
		};
	}
}
