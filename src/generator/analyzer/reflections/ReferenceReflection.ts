import type * as ts from 'typescript';
import type { ReferenceReferenceNode } from '../../../common/reference';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class ReferenceReflection extends SymbolBasedReflection {
	constructor(symbol: ts.Symbol, private readonly _targetId: number) {
		super(symbol);
	}

	serialize(): ReferenceReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'reference',
			target: this._targetId
		};
	}
}
