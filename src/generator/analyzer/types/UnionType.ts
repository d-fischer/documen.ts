import ts from 'typescript';
import type { UnionReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import { resolvePromiseArray } from '../util/promises';
import { Type } from './Type';

export class UnionType extends Type {
	constructor(private readonly _elements: Type[]) {
		super();
	}

	get elements(): readonly Type[] {
		return this._elements;
	}

	serialize(): UnionReferenceType {
		return {
			type: 'union',
			types: this._elements.map(el => el.serialize())
		};
	}
}

export const unionTypeReflector: TypeReflector<ts.UnionTypeNode, ts.UnionType> = {
	kinds: [ts.SyntaxKind.UnionType],
	async fromNode(ctx, node) {
		return new UnionType(await resolvePromiseArray(node.types.map(async subTypeNode => createTypeFromNode(ctx, subTypeNode))));
	},
	async fromType(ctx, type) {
		return new UnionType(await resolvePromiseArray(type.types.map(async (subType) => createTypeFromTsType(ctx, subType))));
	},
};
