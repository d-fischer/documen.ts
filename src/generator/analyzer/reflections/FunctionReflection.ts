import type * as ts from 'typescript';
import type { FunctionReferenceNode, CallSignatureReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { getReflectedCallSignatures } from '../util/functions';
import type { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class FunctionReflection extends SymbolBasedReflection {
	signatures!: SignatureReflection[];

	constructor(symbol: ts.Symbol) {
		super(symbol);

		this._handleFlags(symbol.getDeclarations()?.[0]);
	}

	async processChildren(ctx: AnalyzeContext) {
		this.signatures = await getReflectedCallSignatures(ctx, this._symbol, this);
	}

	serialize(): FunctionReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'function',
			signatures: this.signatures.map(sig => sig.serialize() as CallSignatureReferenceNode)
		};
	}
}
