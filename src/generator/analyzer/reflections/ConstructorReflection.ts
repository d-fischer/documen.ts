import * as ts from 'typescript';
import type { ConstructorReferenceNode, CallSignatureReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class ConstructorReflection extends SymbolBasedReflection {
	signatures!: SignatureReflection[];

	constructor(symbol: ts.Symbol, private readonly _signatures: readonly ts.Signature[]) {
		// class and constructor are the same symbol, so don't register in reverse
		super(symbol, false);

		this._handleFlags(symbol.getDeclarations()?.[0]);
	}

	async processChildren(ctx: AnalyzeContext) {
		this.signatures = await Promise.all(
			this._signatures.map(async (sig, i) =>
				SignatureReflection.fromTsSignature(
					ctx,
					'constructor',
					ts.SyntaxKind.ConstructSignature,
					sig,
					this._symbol.getDeclarations()?.[i] as ts.SignatureDeclaration | undefined
				)
			)
		);
	}

	serialize(): ConstructorReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'constructor',
			signatures: this.signatures.map(sig => sig.serialize() as CallSignatureReferenceNode)
		};
	}
}
