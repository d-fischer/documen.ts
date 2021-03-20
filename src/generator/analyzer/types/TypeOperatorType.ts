import assert from 'assert';
import ts from 'typescript';
import type { TypeOperatorReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import { resolvePromiseArray } from '../util/promises';
import { ArrayType } from './ArrayType';
import { TupleType } from './TupleType';
import { Type } from './Type';
import { UnknownType } from './UnknownType';

export class TypeOperatorType extends Type {
	constructor(private readonly _operator: 'keyof' | 'unique' | 'readonly', private readonly _type: Type) {
		super();
	}

	serialize(): TypeOperatorReferenceType {
		return {
			type: 'typeOperator',
			operator: this._operator,
			target: this._type.serialize()
		};
	}
}

const operators = {
	[ts.SyntaxKind.KeyOfKeyword]: 'keyof',
	[ts.SyntaxKind.UniqueKeyword]: 'unique',
	[ts.SyntaxKind.ReadonlyKeyword]: 'readonly'
} as const;

function isObjectType(type: ts.Type): type is ts.ObjectType {
	return typeof (type as ts.ObjectType).objectFlags === 'number';
}

export const typeOperatorTypeReflector: TypeReflector<ts.TypeOperatorNode> = {
	kinds: [ts.SyntaxKind.TypeOperator],
	async fromNode(ctx, node) {
		return new TypeOperatorType(operators[node.operator], await createTypeFromNode(ctx, node.type));
	},
	async fromType(ctx, type, node) {
		if (node.operator === ts.SyntaxKind.ReadonlyKeyword) {
			assert(isObjectType(type));
			const typeArguments = await resolvePromiseArray(ctx.checker.getTypeArguments(type as ts.TypeReference).map(async typeArg => createTypeFromTsType(ctx, typeArg)));
			// eslint-disable-next-line no-bitwise
			const inner = type.objectFlags & ts.ObjectFlags.Tuple ? new TupleType(typeArguments) : new ArrayType(typeArguments[0]);

			return new TypeOperatorType('readonly', inner);
		}

		if (node.operator === ts.SyntaxKind.KeyOfKeyword) {
			const targetType = (type as ts.Type & { type: ts.Type }).type;
			return new TypeOperatorType('keyof', await createTypeFromTsType(ctx, targetType));
		}

		return new UnknownType(node.getText(), 'TypeOperator');
	}
};
