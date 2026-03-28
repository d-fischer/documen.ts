import type { ReflectionReferenceType } from '../../../common/reference/index.js';
import type { TypeLiteralReflection } from '../reflections/TypeLiteralReflection.js';
import { Type } from './Type.js';

export class ReflectionType extends Type {
	constructor(private readonly _reflection: TypeLiteralReflection) {
		super();
	}

	serialize(): ReflectionReferenceType {
		return {
			type: 'reflection',
			declaration: this._reflection.serialize()
		};
	}
}
