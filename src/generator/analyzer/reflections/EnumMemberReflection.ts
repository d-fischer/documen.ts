import type ts from 'typescript';
import type { EnumMemberReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class EnumMemberReflection extends SymbolBasedReflection {
	private _value!: unknown;

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new EnumMemberReflection(ctx, symbol);
		const declaration = symbol.getDeclarations()?.[0] as ts.EnumMember;

		that._value = ctx.checker.getConstantValue(declaration);

		that._handleFlags(declaration);
		that._processJsDoc();

		return that;
	}

	serialize(): EnumMemberReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'enumMember',
			value: JSON.stringify(this._value)
		};
	}
}
