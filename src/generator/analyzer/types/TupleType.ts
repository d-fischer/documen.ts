import ts from 'typescript';
import type { TupleReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import { resolvePromiseArray } from '../util/promises';
import { removeUndefined } from '../util/types';
import { NamedTupleElementType } from './NamedTupleElementType';
import { Type } from './Type';

export class TupleType extends Type {
	constructor(private readonly _elements: Array<Type | NamedTupleElementType>) {
		super();
	}

	serialize(): TupleReferenceType {
		return {
			type: 'tuple',
			elements: this._elements.map(el => el.serialize())
		};
	}
}

export const tupleTypeReflector: TypeReflector<ts.TupleTypeNode, ts.TupleTypeReference> = {
	kinds: [ts.SyntaxKind.TupleType],
	async fromNode(checker, node) {
		return new TupleType(await resolvePromiseArray(node.elements.map(async subTypeNode => createTypeFromNode(checker, subTypeNode))));
	},
	async fromType(checker, type, node) {
		const elements = node.elements;
		const types = type.typeArguments?.slice(0, elements.length);

		let result: Array<Type | NamedTupleElementType> | undefined = await resolvePromiseArray(types?.map(async t => createTypeFromTsType(checker, t)));

		if (type.target.labeledElementDeclarations) {
			const labels = type.target.labeledElementDeclarations;
			result = result?.map((t, i) => new NamedTupleElementType(labels[i].name.getText(), !!labels[i].questionToken, removeUndefined(t as Type)));
		}

		return new TupleType(result ?? []);
	},
};
