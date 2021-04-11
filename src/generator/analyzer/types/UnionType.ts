import ts from 'typescript';
import type { UnionReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import { resolvePromiseArray } from '../util/promises';
import { IntrinsicType } from './IntrinsicType';
import { LiteralType } from './LiteralType';
import { Type } from './Type';

export class UnionType extends Type {
	constructor(private readonly _elements: Type[]) {
		super();

		this._elements.sort((a, b) => {
			let orderA = 1;
			if (a instanceof LiteralType) {
				if (a.value === null) {
					orderA = 2;
				}
			} else if (a instanceof IntrinsicType) {
				if (a.name === 'undefined') {
					orderA = 3;
				}
			}

			let orderB = 1;
			if (b instanceof LiteralType) {
				if (b.value === null) {
					orderB = 2;
				}
			} else if (b instanceof IntrinsicType) {
				if (b.name === 'undefined') {
					orderB = 3;
				}
			}

			return orderA - orderB;
		});
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
		if (type.origin) {
			return createTypeFromTsType(ctx, type.origin);
		}
		return new UnionType(await resolvePromiseArray(type.types.map(async (subType) => createTypeFromTsType(ctx, subType))));
	},
};
