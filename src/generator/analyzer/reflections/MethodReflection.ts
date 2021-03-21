import type * as ts from 'typescript';
import type { MethodReferenceNode, CallSignatureReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { getReflectedCallSignatures } from '../util/functions';
import type { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class MethodReflection extends SymbolBasedReflection {
	signatures!: SignatureReflection[];

	constructor(symbol: ts.Symbol, private readonly _parentSymbol?: ts.Symbol) {
		super(symbol);

		this._handleFlags(symbol.getDeclarations()?.[0]);
	}

	async processChildren(ctx: AnalyzeContext) {
		await this.processJsDoc();

		this.signatures = await getReflectedCallSignatures(ctx, this._symbol, this, this._parentSymbol);
	}

	serialize(): MethodReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'method',
			signatures: this.signatures.map(sig => sig.serialize() as CallSignatureReferenceNode)
		};
	}
}
