import type { ReflectionReferenceType } from '../../../common/reference';
import type { TypeLiteralReflection } from '../reflections/TypeLiteralReflection';
import { Type } from './Type';

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
