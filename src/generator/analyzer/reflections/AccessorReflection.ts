import * as ts from 'typescript';
import type { AccessorReferenceNode, GetSignatureReferenceNode, SetSignatureReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class AccessorReflection extends SymbolBasedReflection {
	private _getSignature?: SignatureReflection;
	private _setSignature?: SignatureReflection;

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new AccessorReflection(ctx, symbol);
		const symbolDeclarations = that._symbol.getDeclarations();

		that._getSignature = await that._findAndConvertSignature(ctx, symbolDeclarations, ts.isGetAccessor);
		that._setSignature = await that._findAndConvertSignature(ctx, symbolDeclarations, ts.isSetAccessor);

		return that;
	}

	serialize(): AccessorReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'accessor',
			getSignature: this._getSignature?.serialize() as GetSignatureReferenceNode,
			setSignature: this._setSignature?.serialize() as SetSignatureReferenceNode
		};
	}

	private async _findAndConvertSignature<T extends ts.AccessorDeclaration>(ctx: AnalyzeContext, declarations: ts.Declaration[] | undefined, predicate: (decl: ts.Declaration) => decl is T) {
		const decl = declarations?.find(predicate);
		if (decl) {
			const sig = ctx.checker.getSignatureFromDeclaration(decl);
			if (sig) {
				return SignatureReflection.fromTsSignature(ctx, decl.kind, sig, this, decl);
			}
		}
		return undefined;
	}
}
