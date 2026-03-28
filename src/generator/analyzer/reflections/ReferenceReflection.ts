import type * as ts from 'typescript';
import type { ReferenceReferenceNode } from '../../../common/reference/index.js';
import type { AnalyzeContext } from '../AnalyzeContext.js';
import { SymbolBasedReflection } from './SymbolBasedReflection.js';

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
