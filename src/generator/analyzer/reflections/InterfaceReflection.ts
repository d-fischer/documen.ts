import assert from 'assert';
import * as ts from 'typescript';
import type { InterfaceReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createReflection } from '../createReflection';
import { resolvePromiseArray } from '../util/promises';
import type { Reflection } from './Reflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';
import { TypeParameterReflection } from './TypeParameterReflection';

export class InterfaceReflection extends SymbolBasedReflection {
	private _members!: Reflection[];
	private _typeParameters?: TypeParameterReflection[];

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new InterfaceReflection(symbol);

		const type = ctx.checker.getDeclaredTypeOfSymbol(symbol);
		assert(type.isClassOrInterface());

		that._typeParameters = await resolvePromiseArray(type.typeParameters?.map(async (param) => {
			const declaration = param.symbol.declarations[0];
			assert(ts.isTypeParameterDeclaration(declaration));
			return TypeParameterReflection.fromDeclaration(ctx, declaration);
		}));

		const members = ctx.checker.getPropertiesOfType(type);
		that._members = await Promise.all([
			...members.map(async mem => createReflection(ctx, mem))
		]);

		that._handleFlags();
		that._processJsDoc();

		return that;
	}

	serialize(): InterfaceReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'interface',
			members: this._members.map(mem => mem.serialize()),
			typeParameters: this._typeParameters?.map(param => param.serialize())
		};
	}
}
