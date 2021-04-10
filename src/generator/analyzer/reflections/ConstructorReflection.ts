import * as ts from 'typescript';
import type { CallSignatureReferenceNode, ConstructorReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class ConstructorReflection extends SymbolBasedReflection {
	private _signatures!: SignatureReflection[];

	readonly isInheritable = true;

	static async fromSymbolAndSignatures(ctx: AnalyzeContext, symbol: ts.Symbol, signatures: readonly ts.Signature[]) {
		const that = new ConstructorReflection(ctx, symbol);

		that._signatures = await Promise.all(
			signatures
				.filter(sig => !!sig.declaration)
				.map(async (sig, i) => SignatureReflection.fromTsSignature(
					ctx,
					ts.SyntaxKind.ConstructSignature,
					sig,
					that,
					symbol.getDeclarations()?.[i] as ts.SignatureDeclaration | undefined
				))
		);

		that._handleFlags();

		return that;
	}

	constructor(ctx: AnalyzeContext, symbol: ts.Symbol) {
		// class and constructor are the same symbol, so don't register in reverse
		super(ctx, symbol, false);
	}

	serialize(): ConstructorReferenceNode {
		const lastSignature = this._signatures.length ? this._signatures[this._signatures.length - 1] : undefined;
		return {
			...this._baseSerialize((lastSignature?.declarations as ts.Declaration | undefined)?.[0]),
			kind: 'constructor',
			signatures: this._signatures.map(sig => sig.serialize() as CallSignatureReferenceNode)
		};
	}
}
