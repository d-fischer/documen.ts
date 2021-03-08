import ts from 'typescript';
import type { UnionReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
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
	fromNode(checker, node) {
		return new UnionType(node.types.map(subTypeNode => createTypeFromNode(checker, subTypeNode)));
	},
	fromType(checker, type) {
		return new UnionType(type.types.map((subType) => createTypeFromTsType(checker, subType)));
	},
};
