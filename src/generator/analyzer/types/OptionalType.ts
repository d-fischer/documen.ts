import ts from 'typescript';
import type { OptionalReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { createTypeFromNode } from '../createType';
import { removeUndefined } from '../util/types';
import { Type } from './Type';

export class OptionalType extends Type {
	constructor(private readonly _element: Type) {
		super();
	}

	serialize(): OptionalReferenceType {
		return {
			type: 'optional',
			elementType: this._element.serialize()
		};
	}
}

export const optionalTypeReflector: TypeReflector<ts.OptionalTypeNode> = {
	kinds: [ts.SyntaxKind.OptionalType],
	async fromNode(checker, node) {
		return new OptionalType(removeUndefined(await createTypeFromNode(checker, node.type)));
	},
};
