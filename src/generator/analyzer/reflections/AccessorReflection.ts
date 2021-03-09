import * as ts from 'typescript';
import type { AccessorReferenceNode, GetSignatureReferenceNode, SetSignatureReferenceNode } from '../../../common/reference';
import { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class AccessorReflection extends SymbolBasedReflection {
	getSignature?: SignatureReflection;
	setSignature?: SignatureReflection;

	async processChildren(checker: ts.TypeChecker) {
		const signatureDeclarations = this._symbol.getDeclarations();

		this.getSignature = await this._findAndConvertSignature(checker, signatureDeclarations, ts.isGetAccessor);
		this.setSignature = await this._findAndConvertSignature(checker, signatureDeclarations, ts.isSetAccessor);
	}

	serialize(): AccessorReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'accessor',
			getSignature: this.getSignature?.serialize() as GetSignatureReferenceNode,
			setSignature: this.setSignature?.serialize() as SetSignatureReferenceNode
		};
	}

	private async _findAndConvertSignature<T extends ts.AccessorDeclaration>(checker: ts.TypeChecker, declarations: ts.Declaration[] | undefined, predicate: (decl: ts.Declaration) => decl is T) {
		const decl = declarations?.find(predicate);
		if (decl) {
			const sig = checker.getSignatureFromDeclaration(decl);
			if (sig) {
				const sr = new SignatureReflection(this, decl.kind, decl, sig);
				await sr.processChildren(checker);
				return sr;
			}
		}
		return undefined;
	}
}
