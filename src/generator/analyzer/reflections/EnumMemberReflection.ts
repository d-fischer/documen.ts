import type ts from 'typescript';
import type { EnumMemberReferenceNode } from '../../../common/reference';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class EnumMemberReflection extends SymbolBasedReflection {
	value!: unknown;

	async processChildren(checker: ts.TypeChecker): Promise<void> {
		const declaration = this.declarations[0] as ts.EnumMember;

		this.value = checker.getConstantValue(declaration);
	}

	serialize(): EnumMemberReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'enumMember',
			value: JSON.stringify(this.value)
		};
	}
}
