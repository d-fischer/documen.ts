import type ts from 'typescript';
import type { EnumMemberReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class EnumMemberReflection extends SymbolBasedReflection {
	value!: unknown;

	async processChildren(ctx: AnalyzeContext): Promise<void> {
		const declaration = this.declarations[0] as ts.EnumMember;

		this.value = ctx.checker.getConstantValue(declaration);
	}

	serialize(): EnumMemberReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'enumMember',
			value: JSON.stringify(this.value)
		};
	}
}
