import type { InterfaceReferenceNode } from '../../../common/reference';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class InterfaceReflection extends SymbolBasedReflection {
	serialize(): InterfaceReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'interface'
		};
	}
}
