import type { ReferenceType } from '../../../common/reference';
import { Type } from './Type';

export class UnknownType extends Type {
	constructor(private readonly _name: string, private readonly _debugKind: string, private readonly _source = 'direct') {
		super();
	}

	get name() {
		return this._name;
	}

	serialize() {
		return {
			type: '__unhandled',
			name: this._name,
			source: this._source,
			debugKind: this._debugKind
		} as unknown as ReferenceType;
	}
}
