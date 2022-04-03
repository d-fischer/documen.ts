import * as ts from 'typescript';
import type { CallSignatureReferenceNode, ConstructorReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import type { Type } from '../types/Type';
import { handleConstructorInheritance } from '../util/inheritance';
import type { ClassReflection } from './ClassReflection';
import { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class ConstructorReflection extends SymbolBasedReflection {
	private _signatures!: SignatureReflection[];

	readonly isInheritable = true;
	inheritedFrom?: Type;

	static async fromSignatures(ctx: AnalyzeContext, classSymbol: ts.Symbol, signatures: readonly ts.Signature[], parent: ClassReflection) {
		const declaration = signatures[0].declaration as ts.ConstructSignatureDeclaration | undefined;
		const symbol = declaration?.symbol;
		const registerReverse = (declaration?.parent as ts.ClassDeclaration | undefined)?.name?.text === parent.name;
		const that = new ConstructorReflection(ctx, symbol ?? classSymbol, registerReverse);

		that.parent = parent;
		that._signatures = await Promise.all(
			signatures
				.filter(sig => !!sig.declaration)
				.map(async (sig, i) => await SignatureReflection.fromTsSignature(
					ctx,
					ts.SyntaxKind.ConstructSignature,
					sig,
					that,
					symbol?.getDeclarations()?.[i] as ts.SignatureDeclaration | undefined
				))
		);

		handleConstructorInheritance(ctx, that, signatures);

		that._handleFlags();

		return that;
	}

	get name() {
		return this.parent!.name;
	}

	get locationNode() {
		const lastSignature = this._signatures.length ? this._signatures[this._signatures.length - 1] : undefined;
		const declarations = lastSignature?.declarations;
		return declarations?.[0];
	}

	serialize(): ConstructorReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'constructor',
			signatures: this._signatures.map(sig => sig.serialize() as CallSignatureReferenceNode),
			inheritedFrom: this.inheritedFrom?.serialize()
		};
	}
}
