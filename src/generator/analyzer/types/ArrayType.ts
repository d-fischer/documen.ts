import assert from 'assert';
import ts from 'typescript';
import type { ArrayReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import { Type } from './Type';

export class ArrayType extends Type {
	constructor(private readonly _element: Type) {
		super();
	}

	serialize(): ArrayReferenceType {
		return {
			type: 'array',
			elementType: this._element.serialize()
		};
	}
}

export const arrayTypeReflector: TypeReflector<ts.ArrayTypeNode, ts.TypeReference> = {
	kinds: [ts.SyntaxKind.ArrayType],
	fromNode(checker, node) {
		return new ArrayType(createTypeFromNode(checker, node.elementType));
	},
	fromType(checker, type) {
		const typeParams = checker.getTypeArguments(type);
		assert(typeParams.length);
		return new ArrayType(createTypeFromTsType(checker, typeParams[0]));
	},
};