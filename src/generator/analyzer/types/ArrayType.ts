import assert from 'assert';
import ts from 'typescript';
import type { ArrayReferenceType } from '../../../common/reference';
import { createTypeFromNode, createTypeFromTsType, type TypeReflector } from '../createType';
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
	async fromNode(ctx, node) {
		return new ArrayType(await createTypeFromNode(ctx, node.elementType));
	},
	async fromType(ctx, type) {
		const typeParams = ctx.checker.getTypeArguments(type);
		assert(typeParams.length);
		return new ArrayType(await createTypeFromTsType(ctx, typeParams[0]));
	}
};
