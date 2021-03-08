import type { ConstructorReferenceNode } from '../../../common/reference';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class ConstructorReflection extends SymbolBasedReflection {
	serialize(): ConstructorReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'constructor',
			signatures: []
		};
	}
}
