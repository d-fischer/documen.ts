import * as ts from 'typescript';
import type { AccessorReferenceNode, GetSignatureReferenceNode, SetSignatureReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class AccessorReflection extends SymbolBasedReflection {
	getSignature?: SignatureReflection;
	setSignature?: SignatureReflection;

	async processChildren(ctx: AnalyzeContext) {
		await this.processJsDoc();
		const symbolDeclarations = this._symbol.getDeclarations();

		this.getSignature = await this._findAndConvertSignature(ctx, symbolDeclarations, ts.isGetAccessor);
		this.setSignature = await this._findAndConvertSignature(ctx, symbolDeclarations, ts.isSetAccessor);
	}

	serialize(): AccessorReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'accessor',
			getSignature: this.getSignature?.serialize() as GetSignatureReferenceNode,
			setSignature: this.setSignature?.serialize() as SetSignatureReferenceNode
		};
	}

	private async _findAndConvertSignature<T extends ts.AccessorDeclaration>(ctx: AnalyzeContext, declarations: ts.Declaration[] | undefined, predicate: (decl: ts.Declaration) => decl is T) {
		const decl = declarations?.find(predicate);
		if (decl) {
			const sig = ctx.checker.getSignatureFromDeclaration(decl);
			if (sig) {
				return SignatureReflection.fromTsSignature(ctx, this, decl.kind, sig, decl);
			}
		}
		return undefined;
	}
}
