import ts from 'typescript';
import type { IntersectionReferenceType } from '../../../common/reference/index.js';
import { createTypeFromNode, createTypeFromTsType, type TypeReflector } from '../createType.js';
import { resolvePromiseArray } from '../util/promises.js';
import { Type } from './Type.js';

export class IntersectionType extends Type {
	constructor(private readonly _elements: Type[]) {
		super();
	}

	get elements(): readonly Type[] {
		return this._elements;
	}

	serialize(): IntersectionReferenceType {
		return {
			type: 'intersection',
			types: this._elements.map(el => el.serialize())
		};
	}
}

export const intersectionTypeReflector: TypeReflector<ts.IntersectionTypeNode, ts.IntersectionType> = {
	kinds: [ts.SyntaxKind.IntersectionType],
	async fromNode(ctx, node) {
		return new IntersectionType(
			await resolvePromiseArray(node.types.map(async subTypeNode => await createTypeFromNode(ctx, subTypeNode)))
		);
	},
	async fromType(ctx, type) {
		return new IntersectionType(
			await resolvePromiseArray(type.types.map(async subType => await createTypeFromTsType(ctx, subType)))
		);
	}
};
