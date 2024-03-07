import ts from 'typescript';
import type { EnumReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { EnumMemberReflection } from './EnumMemberReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class EnumReflection extends SymbolBasedReflection {
	private _members!: EnumMemberReflection[];

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new EnumReflection(ctx, symbol);

		that._members = symbol.exports
			? await Promise.all(
					[...(symbol.exports as Map<string, ts.Symbol>).values()]
						// eslint-disable-next-line no-bitwise
						.filter(exp => exp.flags & ts.SymbolFlags.EnumMember)
						.map(async exp => await EnumMemberReflection.fromSymbol(ctx, exp))
			  )
			: [];

		that._handleFlags();
		that._processJsDoc();

		return that;
	}

	serialize(): EnumReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'enum',
			members: this._members.map(mem => mem.serialize())
		};
	}
}
