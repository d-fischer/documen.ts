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
	members!: Reflection[];
	typeParameters?: TypeParameterReflection[];

	async processChildren(ctx: AnalyzeContext) {
		const type = ctx.checker.getDeclaredTypeOfSymbol(this._symbol);
		assert(type.isClassOrInterface());

		this.typeParameters = await resolvePromiseArray(type.typeParameters?.map(async (param) => {
			const declaration = param.symbol.declarations[0];
			assert(ts.isTypeParameterDeclaration(declaration));
			const result = new TypeParameterReflection(declaration);
			await result.processChildren(ctx);
			return result;
		}));

		const members = ctx.checker.getPropertiesOfType(type);
		this.members = await Promise.all([
			...members.map(async mem => createReflection(ctx, mem))
		]);
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
