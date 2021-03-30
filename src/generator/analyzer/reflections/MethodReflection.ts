import assert from 'assert';
import * as ts from 'typescript';
import type { CallSignatureReferenceNode, MethodReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { getReflectedCallSignatures } from '../util/functions';
import { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class MethodReflection extends SymbolBasedReflection {
	signatures!: SignatureReflection[];

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol, parentSymbol?: ts.Symbol) {
		const that = new MethodReflection(ctx, symbol);

		that.signatures = await getReflectedCallSignatures(ctx, symbol, that, parentSymbol);

		that._handleFlags();
		that._processJsDoc();

		return that;
	}

	static async fromArrowSymbol(ctx: AnalyzeContext, symbol: ts.Symbol, arrow: ts.ArrowFunction) {
		const that = new MethodReflection(ctx, symbol);

		const parentDeclaration = arrow.parent as ts.PropertyDeclaration;

		const signature = ctx.checker.getSignatureFromDeclaration(arrow);
		assert(signature);

		that.signatures = [
			await SignatureReflection.fromTsSignature(ctx, ts.SyntaxKind.CallSignature, signature, that, arrow),
		]

		that._handleFlags(parentDeclaration);

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
