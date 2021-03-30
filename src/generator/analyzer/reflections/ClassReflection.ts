import assert from 'assert';
import * as ts from 'typescript';
import type { ClassReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
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

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new ClassReflection(ctx, symbol);

		const instanceType = ctx.checker.getDeclaredTypeOfSymbol(symbol);

		assert(instanceType.isClassOrInterface());
		const instanceMembers = ctx.checker.getPropertiesOfType(instanceType);

		const classDeclaration = symbol.getDeclarations()?.find(ts.isClassDeclaration);
		assert(classDeclaration);
		const staticType = ctx.checker.getTypeOfSymbolAtLocation(symbol, classDeclaration);
		const staticMembers = ctx.checker.getPropertiesOfType(staticType);

		that.typeParameters = await resolvePromiseArray(instanceType.typeParameters?.map(async (param) => {
			const declaration = param.symbol.declarations[0];
			assert(ts.isTypeParameterDeclaration(declaration));
			return TypeParameterReflection.fromDeclaration(ctx, declaration);
		}));

		that.members = await Promise.all([
			// eslint-disable-next-line no-bitwise
			...staticMembers.filter(mem => !(mem.flags & ts.SymbolFlags.Prototype)).map(async mem => createReflection(ctx, mem, symbol)),
			...instanceMembers.map(async mem => createReflection(ctx, mem, symbol))
		]);
		that.ctor = await ConstructorReflection.fromSymbolAndSignatures(ctx, symbol, staticType.getConstructSignatures());

		that._handleFlags(symbol.getDeclarations()?.[0]);
		that._processJsDoc();

		return that;
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
