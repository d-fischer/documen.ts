import type * as ts from 'typescript';
import type { ReferenceReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class ReferenceReflection extends SymbolBasedReflection {
	constructor(ctx: AnalyzeContext, symbol: ts.Symbol, private readonly _targetId: number) {
		super(ctx, symbol);
	}

	serialize(): ReferenceReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'reference',
			target: this._targetId
		};
	}
}
