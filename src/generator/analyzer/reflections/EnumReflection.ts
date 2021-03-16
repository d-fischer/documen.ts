import ts from 'typescript';
import type { EnumReferenceNode } from '../../../common/reference';
import { EnumMemberReflection } from './EnumMemberReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class EnumReflection extends SymbolBasedReflection {
	members!: EnumMemberReflection[];

	async processChildren(checker: ts.TypeChecker): Promise<void> {
		this.members = this._symbol.exports
			? await Promise.all([...(this._symbol.exports as Map<string, ts.Symbol>).values()]
				// eslint-disable-next-line no-bitwise
				.filter(exp => exp.flags & ts.SymbolFlags.EnumMember)
				.map(async exp => {
					const result = new EnumMemberReflection(exp);
					await result.processChildren(checker);
					return result;
				}))
			: []
	}

	serialize(): EnumReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'enum',
			members: this.members.map(mem => mem.serialize())
		};
	}
}
