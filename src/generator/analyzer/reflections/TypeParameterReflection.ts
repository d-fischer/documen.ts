import type ts from 'typescript';
import type { TypeParameterReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { Reflection } from './Reflection';

export class TypeParameterReflection extends Reflection {
	private _constraint?: Type;
	private _default?: Type;

	static async fromTsTypeParameter(ctx: AnalyzeContext, param: ts.TypeParameter) {
		const that = new TypeParameterReflection(ctx, undefined, param.symbol.name);

		const tsConstraint = param.getConstraint();
		if (tsConstraint) {
			that._constraint = await createTypeFromTsType(ctx, tsConstraint);
		}

		const tsDefault = param.getDefault();
		if (tsDefault) {
			that._default = await createTypeFromTsType(ctx, tsDefault);
		}

		return that;
	}

	static async fromDeclaration(ctx: AnalyzeContext, param: ts.TypeParameterDeclaration) {
		const that = new TypeParameterReflection(ctx, param);

		const constraintNode = param.constraint;
		if (constraintNode) {
			that._constraint = await createTypeFromNode(ctx, constraintNode);
		}

		const defaultNode = param.default;
		if (defaultNode) {
			that._default = await createTypeFromNode(ctx, defaultNode);
		}

		that._processJsDoc();

		return that;
	}

	constructor(ctx: AnalyzeContext, private readonly _declaration?: ts.TypeParameterDeclaration, private readonly _name?: string) {
		super(ctx);
	}

	get declarations() {
		return this._declaration ? [this._declaration] : [];
	}

	get name() {
		return this._name ?? this._declaration!.name.text;
	}

	serialize(): TypeParameterReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'typeParameter',
			name: this.name,
			constraint: this._constraint?.serialize(),
			default: this._default?.serialize(),
		};
	}
}
