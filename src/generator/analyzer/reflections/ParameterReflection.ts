import * as ts from 'typescript';
import type { ParameterReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { stringifyExpression } from '../util/expressions';
import { removeUndefined } from '../util/types';
import { Reflection } from './Reflection';

export class ParameterReflection extends Reflection {
	private _name!: string;
	private _type!: Type;
	private _defaultValue?: string;

	static async fromSymbol(ctx: AnalyzeContext, symbol: ts.Symbol, declaration?: ts.ParameterDeclaration) {
		declaration ??= symbol.getDeclarations()?.[0] as ts.ParameterDeclaration | undefined;

		const that = new ParameterReflection(ctx, declaration);

		const valueDeclaration = symbol.valueDeclaration as ts.Declaration | undefined;
		// eslint-disable-next-line @typescript-eslint/init-declarations
		let type: Type;
		if (valueDeclaration) {
			if (ts.isParameter(valueDeclaration) && valueDeclaration.type) {
				type = await createTypeFromNode(ctx, valueDeclaration.type);
			} else {
				type = await createTypeFromTsType(ctx, ctx.checker.getTypeOfSymbolAtLocation(symbol, valueDeclaration));
			}
		} else {
			type = await createTypeFromTsType(ctx, (symbol as ts.Symbol & { type: ts.Type }).type);
		}

		let isOptional = false;
		if (valueDeclaration && ts.isParameter(valueDeclaration)) {
			isOptional = !!valueDeclaration.questionToken;
		}

		if (isOptional) {
			type = removeUndefined(type);
		}

		that._name = symbol.name;
		that._type = type;
		that._defaultValue = declaration?.initializer ? stringifyExpression(declaration.initializer) : undefined;

		const isRest = valueDeclaration && ts.isParameter(valueDeclaration) ? !!valueDeclaration.dotDotDotToken : false;

		that._handleFlags();
		if (isOptional) {
			that.flags.add('isOptional');
		}
		if (isRest) {
			that.flags.add('isRest');
		}
		that._processJsDoc();

		return that;
	}

	static async fromNode(ctx: AnalyzeContext, declaration: ts.ParameterDeclaration) {
		const that = new ParameterReflection(ctx, declaration);

		let type = await createTypeFromNode(ctx, declaration.type);
		const isRest = !!declaration.dotDotDotToken;
		const isOptional = !!declaration.questionToken;
		if (isOptional) {
			type = removeUndefined(type);
		}
		that._name = declaration.name.getText();
		that._type = type;
		that._defaultValue = declaration.initializer ? stringifyExpression(declaration.initializer) : undefined;

		if (isOptional) {
			that.flags.add('isOptional');
		}
		if (isRest) {
			that.flags.add('isRest');
		}

		return that;
	}

	constructor(ctx: AnalyzeContext, private readonly _declaration?: ts.ParameterDeclaration) {
		super(ctx);

		this._handleFlags(_declaration);
	}

	get declarations() {
		return this._declaration ? [this._declaration] : [];
	}

	serialize(): ParameterReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'parameter',
			type: this._type.serialize(),
			defaultValue: this._defaultValue
		};
	}

	get name() {
		return this._name;
	}
}
