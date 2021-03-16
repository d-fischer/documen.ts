import * as ts from 'typescript';
import type { ParameterReferenceNode } from '../../../common/reference';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { stringifyExpression } from '../util/expressions';
import { removeUndefined } from '../util/types';
import { Reflection } from './Reflection';

export class ParameterReflection extends Reflection {
	static fromSymbol(checker: ts.TypeChecker, symbol: ts.Symbol, declaration?: ts.ParameterDeclaration) {
		const valueDeclaration = symbol.valueDeclaration as ts.Declaration | undefined;
		// eslint-disable-next-line @typescript-eslint/init-declarations
		let type: Type;
		if (valueDeclaration) {
			if (ts.isParameter(valueDeclaration) && valueDeclaration.type) {
				type = createTypeFromNode(checker, valueDeclaration.type);
			} else {
				type = createTypeFromTsType(checker, checker.getTypeOfSymbolAtLocation(symbol, valueDeclaration));
			}
		} else {
			type = createTypeFromTsType(checker, (symbol as ts.Symbol & { type: ts.Type }).type);
		}

		let isOptional = false;
		if (valueDeclaration && ts.isParameter(valueDeclaration)) {
			isOptional = !!valueDeclaration.questionToken;
		}

		if (isOptional) {
			type = removeUndefined(type);
		}

		const defaultValue = declaration?.initializer ? stringifyExpression(declaration.initializer) : undefined;
		const isRest = valueDeclaration && ts.isParameter(valueDeclaration) ? !!valueDeclaration.dotDotDotToken : false;

		return new ParameterReflection(symbol.name, type, isOptional, isRest, defaultValue, declaration ?? symbol.getDeclarations()?.[0] as ts.ParameterDeclaration | undefined);
	}

	static fromNode(checker: ts.TypeChecker, declaration: ts.ParameterDeclaration) {
		let type = createTypeFromNode(checker, declaration.type);
		const isRest = !!declaration.dotDotDotToken;
		const isOptional = !!declaration.questionToken;
		if (isOptional) {
			type = removeUndefined(type);
		}
		const defaultValue = declaration.initializer ? stringifyExpression(declaration.initializer) : undefined;
		return new ParameterReflection(declaration.name.getText(), type, isOptional, isRest, defaultValue, declaration);
	}

	constructor(private readonly _name: string, private readonly _type: Type, private readonly _isOptional: boolean, private readonly _isRest: boolean, private readonly _defaultValue?: string, private readonly _declaration?: ts.ParameterDeclaration) {
		super();

		if (this._isOptional) {
			this._flags.add('isOptional');
		}
		if (this._isRest) {
			this._flags.add('isRest');
		}

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
