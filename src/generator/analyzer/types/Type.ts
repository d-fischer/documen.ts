import type { ReferenceType } from '../../../common/reference/index.js';

export abstract class Type {
	abstract serialize(): ReferenceType;
}
