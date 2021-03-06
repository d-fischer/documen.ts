import ts from 'typescript';
import type { PropertyReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import type { ReferenceType } from '../types/ReferenceType';
import type { Type } from '../types/Type';
import { handleInheritance } from '../util/inheritance';
import { MethodReflection } from './MethodReflection';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class PropertyReflection extends SymbolBasedReflection {
	private _type!: Type;

	readonly isInheritable = true;
	inheritedFrom?: ReferenceType;
	overwrites?: ReferenceType;

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol, parent: SymbolBasedReflection) {
		const declarations = symbol.getDeclarations();
		if (declarations?.every(decl => ts.isMethodDeclaration(decl) || ts.isMethodSignature(decl))) {
			return MethodReflection.fromSymbol(ctx, symbol, parent);
		}

		const declaration = declarations?.[0];
		if (declaration) {
			if (ts.isPropertyDeclaration(declaration) && declaration.initializer && ts.isArrowFunction(declaration.initializer)) {
				return MethodReflection.fromArrowSymbol(ctx, symbol, declaration.initializer, parent);
			}
		}

		const that = new PropertyReflection(ctx, symbol);
		that.parent = parent;

		that._type = declaration && (ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)) && declaration.type
			? await createTypeFromNode(ctx, declaration.type)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			: await createTypeFromTsType(ctx, ctx.checker.getTypeOfSymbolAtLocation(symbol, {} as any));

		that._handleFlags();
		that._processJsDoc();

		handleInheritance(ctx, that);

		return that;
	}

	get locationNode() {
		return (this.declarations[0] as ts.PropertyDeclaration | undefined)?.name;
	}

	serialize(): PropertyReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'property',
			type: this._type.serialize(),
			inheritedFrom: this.inheritedFrom?.serialize(),
			overwrites: this.overwrites?.serialize()
		};
	}
}
