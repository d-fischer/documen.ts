import assert from 'assert';
import * as ts from 'typescript';
import type { TypeAliasReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createTypeFromNode } from '../createType';
import type { Type } from '../types/Type';
import { resolvePromiseArray } from '../util/promises';
import { SymbolBasedReflection } from './SymbolBasedReflection';
import { TypeParameterReflection } from './TypeParameterReflection';

export class TypeAliasReflection extends SymbolBasedReflection {
	private _type!: Type;
	private _parameters?: TypeParameterReflection[];

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol) {
		const that = new TypeAliasReflection(ctx, symbol);

		const decl = symbol.getDeclarations()?.find(ts.isTypeAliasDeclaration);
		assert(decl);
		that._type = await createTypeFromNode(ctx, decl.type);
		that._parameters = await resolvePromiseArray(
			decl.typeParameters?.map(async param => await TypeParameterReflection.fromDeclaration(ctx, param))
		);

		that._handleFlags();
		that._processJsDoc();

		return that;
	}

	serialize(): TypeAliasReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'typeAlias',
			type: this._type.serialize(),
			typeParameters: this._parameters?.map(param => param.serialize())
		};
	}
}
