import * as ts from 'typescript';
import type { AccessorReferenceNode, GetSignatureReferenceNode, SetSignatureReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import type { ReferenceType } from '../types/ReferenceType';
import { handleInherit } from '../util/inheritance';
import { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class AccessorReflection extends SymbolBasedReflection {
	private _getSignature?: SignatureReflection;
	private _setSignature?: SignatureReflection;

	readonly isInheritable = true;
	inheritedFrom?: ReferenceType;

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol, parent?: SymbolBasedReflection) {
		const that = new AccessorReflection(ctx, symbol);
		const symbolDeclarations = that._symbol.getDeclarations();

		that._getSignature = await that._findAndConvertSignature(ctx, symbolDeclarations, ts.isGetAccessor);
		that._setSignature = await that._findAndConvertSignature(ctx, symbolDeclarations, ts.isSetAccessor);

		that.parent = parent;

		handleInherit(ctx, that);

		return that;
	}

	serialize(): AccessorReferenceNode {
		return {
			...this._baseSerialize((this.declarations[0] as ts.AccessorDeclaration | undefined)?.name),
			kind: 'accessor',
			getSignature: this._getSignature?.serialize() as GetSignatureReferenceNode,
			setSignature: this._setSignature?.serialize() as SetSignatureReferenceNode,
			inheritedFrom: this.inheritedFrom?.serialize()
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
