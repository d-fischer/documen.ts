import ts from 'typescript';
import type { OptionalReferenceType } from '../../../common/reference/index.js';
import { createTypeFromNode, type TypeReflector } from '../createType.js';
import { removeUndefined } from '../util/types.js';
import { Type } from './Type.js';

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
	async fromNode(ctx, node) {
		return new OptionalType(removeUndefined(await createTypeFromNode(ctx, node.type)));
	}
};
