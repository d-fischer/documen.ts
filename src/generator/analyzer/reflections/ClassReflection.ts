import assert from 'assert';
import * as ts from 'typescript';
import type { ClassReferenceNode } from '../../../common/reference';
import { createReflection } from '../createReflection';
import { resolvePromiseArray } from '../util/promises';
import { ConstructorReflection } from './ConstructorReflection';
import type { Reflection } from './Reflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';
import { TypeParameterReflection } from './TypeParameterReflection';

export class ClassReflection extends SymbolBasedReflection {
	ctor?: ConstructorReflection;
	members!: Reflection[];
	typeParameters?: TypeParameterReflection[];

	constructor(symbol: ts.Symbol) {
		super(symbol);

		this._handleFlags(symbol.getDeclarations()?.[0]);
	}

	async processChildren(checker: ts.TypeChecker) {
		const instanceType = checker.getDeclaredTypeOfSymbol(this._symbol);
		assert(instanceType.isClassOrInterface());
		const instanceMembers = checker.getPropertiesOfType(instanceType);

		const classDeclaration = this._symbol.getDeclarations()?.find(ts.isClassDeclaration);
		assert(classDeclaration);
		const staticType = checker.getTypeOfSymbolAtLocation(this._symbol, classDeclaration);
		const staticMembers = checker.getPropertiesOfType(staticType);

		this.typeParameters = await resolvePromiseArray(instanceType.typeParameters?.map(async (param) => {
			const declaration = param.symbol.declarations[0];
			assert(ts.isTypeParameterDeclaration(declaration));
			const result = new TypeParameterReflection(declaration);
			await result.processChildren(checker);
			return result;
		}));

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
