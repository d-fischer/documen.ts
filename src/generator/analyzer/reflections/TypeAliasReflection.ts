import assert from 'assert';
import * as ts from 'typescript';
import type { TypeAliasReferenceNode } from '../../../common/reference';
import { createTypeFromNode } from '../createType';
import type { Type } from '../types/Type';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class TypeAliasReflection extends SymbolBasedReflection {
	type!: Type;

	async processChildren(checker: ts.TypeChecker) {
		const decl = this._symbol.getDeclarations()?.find(ts.isTypeAliasDeclaration);
		assert(decl);
		this.type = createTypeFromNode(checker, decl.type);
	}

	serialize(): TypeAliasReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'typeAlias',
			type: this.type.serialize()
		};
	}
}
