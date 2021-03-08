import type { ReferenceType } from '../../../common/reference';

export abstract class Type {
	abstract serialize(): ReferenceType;
}
