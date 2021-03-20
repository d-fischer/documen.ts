import assert from 'assert';
import * as ts from 'typescript';
import type { TypeAliasReferenceNode } from '../../../common/reference';
import { createTypeFromNode } from '../createType';
import type { Type } from '../types/Type';
import { resolvePromiseArray } from '../util/promises';
import { SymbolBasedReflection } from './SymbolBasedReflection';
import { TypeParameterReflection } from './TypeParameterReflection';

export class TypeAliasReflection extends SymbolBasedReflection {
	type!: Type;
	parameters?: TypeParameterReflection[];

	async processChildren(checker: ts.TypeChecker) {
		const decl = this._symbol.getDeclarations()?.find(ts.isTypeAliasDeclaration);
		assert(decl);
		this.type = await createTypeFromNode(checker, decl.type);
		this.parameters = await resolvePromiseArray(decl.typeParameters?.map(async param => {
			const result = new TypeParameterReflection(param);
			await result.processChildren(checker);
			return result;
		}));
	}

	serialize(): TypeAliasReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'typeAlias',
			type: this.type.serialize(),

		};
	}
}
