import assert from 'assert';
import * as ts from 'typescript';
import type { ClassReferenceNode } from '../../../common/reference';
import { createReflection } from '../createReflection';
import { ConstructorReflection } from './ConstructorReflection';
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
		const instanceMembers = checker.getPropertiesOfType(instanceType);

		const classDeclaration = this._symbol.getDeclarations()?.find(ts.isClassDeclaration);
		assert(classDeclaration);
		const staticType = checker.getTypeOfSymbolAtLocation(this._symbol, classDeclaration);
		const staticMembers = checker.getPropertiesOfType(staticType);
		this.members = await Promise.all([
			// eslint-disable-next-line no-bitwise
			...staticMembers.filter(mem => !(mem.flags & ts.SymbolFlags.Prototype)).map(async mem => createReflection(checker, mem)),
			...instanceMembers.map(async mem => createReflection(checker, mem))
		]);
		const ctor = new ConstructorReflection(this._symbol, staticType.getConstructSignatures())
		await ctor.processChildren(checker);
		this.ctor = ctor;
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
