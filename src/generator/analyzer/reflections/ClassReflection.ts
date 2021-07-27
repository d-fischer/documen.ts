import assert from 'assert';
import * as ts from 'typescript';
import type { ClassReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createReflection } from '../createReflection';
import { resolvePromiseArray } from '../util/promises';
import { ConstructorReflection } from './ConstructorReflection';
import { Heritage } from './Heritage';
import { SymbolBasedReflection } from './SymbolBasedReflection';
import { TypeParameterReflection } from './TypeParameterReflection';

export class ClassReflection extends SymbolBasedReflection {
	ctor?: ConstructorReflection;
	members!: SymbolBasedReflection[];
	typeParameters?: TypeParameterReflection[];

	extends?: Heritage[];

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new ClassReflection(ctx, symbol);

		const instanceType = ctx.checker.getDeclaredTypeOfSymbol(symbol);
		assert(instanceType.isClassOrInterface());

		const extendsTypes = await resolvePromiseArray(
			symbol.getDeclarations()
				?.filter((decl): decl is ts.ClassDeclaration => ts.isClassDeclaration(decl))
				.flatMap(decl => decl.heritageClauses
					?.filter(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)
					.flatMap(clause => clause.types.map(async type => Heritage.fromTypeNode(ctx, type))) ?? []
				)
		);

		if (extendsTypes?.length) {
			that.extends = extendsTypes;
		}

		const instanceMembers = ctx.checker.getPropertiesOfType(instanceType);

		const classDeclaration = symbol.getDeclarations()?.find(ts.isClassDeclaration);
		assert(classDeclaration);
		const staticType = ctx.checker.getTypeOfSymbolAtLocation(symbol, classDeclaration);
		const staticMembers = ctx.checker.getPropertiesOfType(staticType);

		that.typeParameters = await resolvePromiseArray(instanceType.typeParameters?.map(async (param) => {
			const declaration = param.symbol.declarations?.[0];
			assert(declaration && ts.isTypeParameterDeclaration(declaration));
			return TypeParameterReflection.fromDeclaration(ctx, declaration);
		}));

		ctx.staticContext = true;
		// eslint-disable-next-line no-bitwise
		that.members = await Promise.all(staticMembers.filter(mem => !(mem.flags & ts.SymbolFlags.Prototype)).map(async mem => createReflection(ctx, mem, that) as Promise<SymbolBasedReflection>));
		ctx.staticContext = false;

		that.members.push(...(await Promise.all(instanceMembers.map(async mem => createReflection(ctx, mem, that) as Promise<SymbolBasedReflection>))));

		that.ctor = await ConstructorReflection.fromSignatures(ctx, symbol, staticType.getConstructSignatures(), that);

		that._handleFlags(symbol.getDeclarations()?.[0]);
		that._processJsDoc();

		return that;
	}

	get locationNode() {
		return (this.declarations[0] as ts.ClassDeclaration | undefined)?.name;
	}

	serialize(): ClassReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'class',
			ctor: this.ctor?.serialize(),
			members: this.members.map(m => m.serialize()),
			extendedTypes: this.extends?.map(ext => ext.type.serialize()),
			typeParameters: this.typeParameters?.map(param => param.serialize())
		};
	}
}
