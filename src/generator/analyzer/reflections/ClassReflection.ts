import assert from 'assert';
import type * as ts from 'typescript';
import type { ClassReferenceNode } from '../../../common/reference';
import { createReflection } from '../createReflection';
import type { ConstructorReflection } from './ConstructorReflection';
import type { Reflection } from './Reflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class ClassReflection extends SymbolBasedReflection {
	ctor?: ConstructorReflection;
	members!: Reflection[];

	constructor(symbol: ts.Symbol) {
		super(symbol);

		this._handleFlags(symbol.declarations[0]);
	}

	async processChildren(checker: ts.TypeChecker) {
		const instanceType = checker.getDeclaredTypeOfSymbol(this._symbol);
		assert(instanceType.isClassOrInterface());
		const members = checker.getPropertiesOfType(instanceType);
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		this.members = await Promise.all(members.map(async member => createReflection(checker, member)));
	}

	serialize(): ClassReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'class',
			ctor: this.ctor?.serialize(),
			members: this.members.map(m => m.serialize())
		};
	}
}
