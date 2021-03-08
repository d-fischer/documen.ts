import type { ReferenceType } from '../../../common/reference';
import { Type } from './Type';

export class UnknownType extends Type {
	constructor(private readonly _name: string, private readonly _source = 'direct') {
		super();
	}

	serialize() {
		return {
			type: '__unhandled',
			name: this._name,
			source: this._source
		} as unknown as ReferenceType;
	}
}
