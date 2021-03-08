import assert from 'assert';
import ts from 'typescript';
import type { ReferenceReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import { SymbolBasedReflection } from '../reflections/SymbolBasedReflection';
import { resolveAliasesForSymbol } from '../util/symbolUtil';
import { Type } from './Type';

export class ReferenceType extends Type {
	constructor(private readonly _name: string, private readonly _typeArguments: Type[], private readonly _id?: number) {
		super();
	}

	serialize(): ReferenceReferenceType {
		return {
			type: 'reference',
			name: this._name,
			id: this._id,
			typeArguments: this._typeArguments.map(arg => arg.serialize())
		};
	}
}

export const referenceTypeReflector: TypeReflector<ts.TypeReferenceNode, ts.TypeReference> = {
	kinds: [ts.SyntaxKind.TypeReference],

	fromNode(checker, node) {
		const isArray = checker.typeToTypeNode(checker.getTypeAtLocation(node.typeName), void 0, ts.NodeBuilderFlags.IgnoreErrors)?.kind === ts.SyntaxKind.ArrayType;

		if (isArray) {
			// return new ArrayType(convertType(context, node.typeArguments?.[0]));
		}

		const name = node.typeName.getText();

		const symbol = checker.getSymbolAtLocation(node.typeName)!;
		const origSymbol = resolveAliasesForSymbol(checker, symbol);

		return new ReferenceType(name, node.typeArguments?.map(typeNode => createTypeFromNode(checker, typeNode)) ?? [], SymbolBasedReflection.getReflectionIdForSymbol(origSymbol));
	},
	fromType(checker, type) {
		const symbol = type.aliasSymbol ?? type.getSymbol();
		assert(symbol);
		const origSymbol = resolveAliasesForSymbol(checker, symbol);
		return new ReferenceType(symbol.name, type.typeArguments?.map(arg => createTypeFromTsType(checker, arg)) ?? [], SymbolBasedReflection.getReflectionIdForSymbol(origSymbol));
	}
};
