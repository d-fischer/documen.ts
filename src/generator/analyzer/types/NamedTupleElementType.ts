import ts from 'typescript';
import type { NamedTupleMemberReferenceType } from '../../../common/reference/index.js';
import { createTypeFromNode, type TypeReflector } from '../createType.js';
import type { Type } from './Type.js';

export class NamedTupleElementType {
	constructor(private readonly _name: string, private readonly _optional: boolean, private readonly _type: Type) {}

	get name() {
		return this._name;
	}

	get isOptional() {
		return this._optional;
	}

	get type() {
		return this._type;
	}

	serialize(): NamedTupleMemberReferenceType {
		return {
			type: 'named-tuple-member',
			name: this._name,
			isOptional: this._optional,
			elementType: this._type.serialize()
		};
	}
}

export const namedTupleElementReflector: TypeReflector<ts.NamedTupleMember> = {
	kinds: [ts.SyntaxKind.NamedTupleMember],
	async fromNode(ctx, node) {
		return new NamedTupleElementType(
			node.name.getText(),
			!!node.questionToken,
			await createTypeFromNode(ctx, node.type)
		);
	}
};
