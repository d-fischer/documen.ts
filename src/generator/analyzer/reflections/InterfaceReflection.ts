import assert from 'assert';
import * as ts from 'typescript';
import type { InterfaceReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createReflection } from '../createReflection';
import { resolvePromiseArray } from '../util/promises';
import { Heritage } from './Heritage';
import type { Reflection } from './Reflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';
import { TypeParameterReflection } from './TypeParameterReflection';

export class InterfaceReflection extends SymbolBasedReflection {
	members!: Reflection[];
	typeParameters?: TypeParameterReflection[];

	extends?: Heritage[];

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new InterfaceReflection(ctx, symbol);

		const type = ctx.checker.getDeclaredTypeOfSymbol(symbol);
		assert(type.isClassOrInterface());

		const extendsTypes = await resolvePromiseArray(
			symbol.getDeclarations()
				?.filter((decl): decl is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(decl))
				.flatMap(decl => decl.heritageClauses
					?.filter(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)
					.flatMap(clause => clause.types.map(async extendedType => await Heritage.fromTypeNode(ctx, extendedType))) ?? []
				)
		);

		if (extendsTypes?.length) {
			that.extends = extendsTypes;
		}

		that.typeParameters = await resolvePromiseArray(type.typeParameters?.map(async param => {
			const declaration = param.symbol.declarations?.[0];
			assert(declaration && ts.isTypeParameterDeclaration(declaration));
			return await TypeParameterReflection.fromDeclaration(ctx, declaration);
		}));

		const members = ctx.checker.getPropertiesOfType(type);
		that.members = await Promise.all([
			...members.map(async mem => await createReflection(ctx, mem, that))
		]);

		that._handleFlags();
		that._processJsDoc();

		return that;
	}

	serialize(): InterfaceReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'interface',
			members: this.members.map(mem => mem.serialize()),
			typeParameters: this.typeParameters?.map(param => param.serialize())
		};
	}
}
