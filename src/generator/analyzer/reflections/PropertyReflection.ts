import ts from 'typescript';
import type { PropertyReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class PropertyReflection extends SymbolBasedReflection {
	type!: Type;

	constructor(symbol: ts.Symbol) {
		super(symbol);

		this._handleFlags(symbol.getDeclarations()?.[0]);
	}

	async processChildren(ctx: AnalyzeContext): Promise<void> {
		const declaration = this._symbol.getDeclarations()?.[0];
		this.type = declaration && (ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)) && declaration.type
			? await createTypeFromNode(ctx, declaration.type)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			: await createTypeFromTsType(ctx, ctx.checker.getTypeOfSymbolAtLocation(this._symbol, {} as any));
	}

	serialize(): PropertyReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'property',
			type: this.type.serialize(),

		};
	}
}
