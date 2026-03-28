import { IntrinsicType } from '../types/IntrinsicType.js';
import type { Type } from '../types/Type.js';
import { UnionType } from '../types/UnionType.js';

export function removeUndefined(type: Type) {
	if (type instanceof UnionType) {
		const otherTypes = type.elements.filter(t => !(t instanceof IntrinsicType && t.name === 'undefined'));
		if (otherTypes.length === 1) {
			return otherTypes[0];
		}
		return new UnionType(otherTypes);
	}
	return type;
}
