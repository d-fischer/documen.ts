import assert from 'assert';
import * as ts from 'typescript';
import type { TypeAliasReferenceNode } from '../../../common/reference/index.js';
import type { AnalyzeContext } from '../AnalyzeContext.js';
import { createTypeFromNode } from '../createType.js';
import type { Type } from '../types/Type.js';
import { resolvePromiseArray } from '../util/promises.js';
import { SymbolBasedReflection } from './SymbolBasedReflection.js';
import { TypeParameterReflection } from './TypeParameterReflection.js';

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
