import ts from 'typescript';
import type { TupleReferenceType } from '../../../common/reference';
import { createTypeFromNode, createTypeFromTsType, type TypeReflector } from '../createType';
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
	async fromNode(ctx, node) {
		return new TupleType(
			await resolvePromiseArray(
				node.elements.map(async subTypeNode => await createTypeFromNode(ctx, subTypeNode))
			)
		);
	},
	async fromType(ctx, type, node) {
		const { elements } = node;
		const types = type.typeArguments?.slice(0, elements.length);

		let result: Array<Type | NamedTupleElementType> | undefined = await resolvePromiseArray(
			types?.map(async t => await createTypeFromTsType(ctx, t))
		);

		if (type.target.labeledElementDeclarations) {
			const labels = type.target.labeledElementDeclarations;
			result = result?.map((t, i) => {
				const label = labels[i];
				return label
					? new NamedTupleElementType(label.name.getText(), !!label.questionToken, removeUndefined(t as Type))
					: t;
			});
		}

		return new TupleType(result ?? []);
	}
};
