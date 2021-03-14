import * as ts from 'typescript';
import type { ParameterReferenceNode } from '../../../common/reference';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { stringifyExpression } from '../util/expressions';
import { removeUndefined } from '../util/types';
import { SymbolBasedReflection } from './SymbolBasedReflection';

export class ParameterReflection extends SymbolBasedReflection {
	type!: Type;
	defaultValue?: string;
	isOptional!: boolean;
	isRest!: boolean;

	constructor(symbol: ts.Symbol, private readonly _declaration?: ts.ParameterDeclaration) {
		super(symbol);

		this._handleFlags(_declaration ?? symbol.declarations[0]);
	}

	async processChildren(checker: ts.TypeChecker) {
		const valueDeclaration = this._symbol.valueDeclaration as ts.Declaration | undefined;
		if (valueDeclaration) {
			if (ts.isParameter(valueDeclaration) && valueDeclaration.type) {
				this.type = createTypeFromNode(checker, valueDeclaration.type);
			} else {
				this.type = createTypeFromTsType(checker, checker.getTypeOfSymbolAtLocation(this._symbol, valueDeclaration));
			}
		} else {
			this.type = createTypeFromTsType(checker, (this._symbol as ts.Symbol & { type: ts.Type }).type);
		}

		let isOptional = false;
		if (valueDeclaration && ts.isParameter(valueDeclaration)) {
			isOptional = !!valueDeclaration.questionToken;
		}

		if (isOptional) {
			this.type = removeUndefined(this.type);
		}

		if (this._declaration?.initializer) {
			this.defaultValue = stringifyExpression(this._declaration.initializer);
		}
		this.isOptional = isOptional;
		this.isRest = valueDeclaration && ts.isParameter(valueDeclaration) ? !!valueDeclaration.dotDotDotToken : false;
	}

	serialize(): ParameterReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'parameter',
			type: this.type.serialize(),
			defaultValue: this.defaultValue
		};
	}

	get name() {
		return this._symbol.name;
	}
}
