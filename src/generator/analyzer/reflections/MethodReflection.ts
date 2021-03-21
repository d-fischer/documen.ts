import type * as ts from 'typescript';
import type { MethodReferenceNode, CallSignatureReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { getReflectedCallSignatures } from '../util/functions';
import type { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class MethodReflection extends SymbolBasedReflection {
	signatures!: SignatureReflection[];

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol, parentSymbol?: ts.Symbol) {
		const that = new MethodReflection(ctx, symbol);

		that.signatures = await getReflectedCallSignatures(ctx, symbol, that, parentSymbol);

		that._handleFlags();

		return that;
	}

	serialize(): MethodReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'method',
			signatures: this.signatures.map(sig => sig.serialize() as CallSignatureReferenceNode)
		};
	}
}
