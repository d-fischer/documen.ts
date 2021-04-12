import assert from 'assert';
import * as ts from 'typescript';
import type { CallSignatureReferenceNode, MethodReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import type { ReferenceType } from '../types/ReferenceType';
import { getReflectedCallSignatures } from '../util/functions';
import { handleInheritance } from '../util/inheritance';
import { SignatureReflection } from './SignatureReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class MethodReflection extends SymbolBasedReflection {
	signatures!: SignatureReflection[];

	readonly isInheritable = true;
	inheritedFrom?: ReferenceType;
	overwrites?: ReferenceType;

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol, parent: SymbolBasedReflection) {
		const that = new MethodReflection(ctx, symbol);
		that.parent = parent;

		that.signatures = await getReflectedCallSignatures(ctx, symbol, that, parent);

		that._handleFlags();
		that._processJsDoc();

		handleInheritance(ctx, that);

		return that;
	}

	static async fromArrowSymbol(ctx: AnalyzeContext, symbol: ts.Symbol, arrow: ts.ArrowFunction, parent: SymbolBasedReflection) {
		const that = new MethodReflection(ctx, symbol);
		that.parent = parent;

		const parentDeclaration = arrow.parent as ts.PropertyDeclaration;

		const signature = ctx.checker.getSignatureFromDeclaration(arrow);
		assert(signature);

		that.signatures = [
			await SignatureReflection.fromTsSignature(ctx, ts.SyntaxKind.CallSignature, signature, that, arrow),
		]

		that._handleFlags(parentDeclaration);

		handleInheritance(ctx, that);

		return that;
	}

	get locationNode() {
		return (this._symbol.getDeclarations()?.[0] as ts.MethodDeclaration | undefined)?.name;
	}

	serialize(): MethodReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'method',
			signatures: this.signatures.map(sig => sig.serialize() as CallSignatureReferenceNode),
			inheritedFrom: this.inheritedFrom?.serialize(),
			overwrites: this.overwrites?.serialize()
		};
	}
}
