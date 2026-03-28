import type * as ts from 'typescript';
import type { CallSignatureReferenceNode, FunctionReferenceNode } from '../../../common/reference/index.js';
import type { AnalyzeContext } from '../AnalyzeContext.js';
import { getReflectedCallSignatures } from '../util/functions.js';
import type { SignatureReflection } from './SignatureReflection.js';
import { SymbolBasedReflection } from './SymbolBasedReflection.js';

export class FunctionReflection extends SymbolBasedReflection {
	private _signatures!: SignatureReflection[];

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new FunctionReflection(ctx, symbol);

		that._signatures = await getReflectedCallSignatures(ctx, symbol, that);

		that._handleFlags();

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
