import ts from 'typescript';
import type { PropertyReferenceNode } from '../../../common/reference';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class PropertyReflection extends SymbolBasedReflection {
	type!: Type;

	constructor(symbol: ts.Symbol) {
		super(symbol);

		this._handleFlags(symbol.declarations[0]);
	}

	async processChildren(checker: ts.TypeChecker): Promise<void> {
		const declaration = this._symbol.getDeclarations()?.[0];
		this.type = declaration && (ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)) && declaration.type
			? createTypeFromNode(checker, declaration.type)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			: createTypeFromTsType(checker, checker.getTypeOfSymbolAtLocation(this._symbol, {} as any));
	}

	serialize(): PropertyReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'property',
			type: this.type.serialize(),

		};
	}
}
