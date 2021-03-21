import type * as ts from 'typescript';
import type { FunctionReferenceNode, CallSignatureReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { getReflectedCallSignatures } from '../util/functions';
import type { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class FunctionReflection extends SymbolBasedReflection {
	private _signatures!: SignatureReflection[];

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new FunctionReflection(symbol);

		that._signatures = await getReflectedCallSignatures(ctx, symbol, that);

		that._handleFlags();
		that._processJsDoc();

		return that;
	}

	serialize(): FunctionReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'function',
			signatures: this._signatures.map(sig => sig.serialize() as CallSignatureReferenceNode)
		};
	}
}
