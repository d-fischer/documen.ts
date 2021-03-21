import type * as ts from 'typescript';
import type { AnalyzeContext } from '../AnalyzeContext';
import { Reflection } from './Reflection';

export class SymbolBasedReflection extends Reflection {
	private static readonly _symbolsByReflectionId = new Map<number, ts.Symbol>();
	private static readonly _reflectionIdsBySymbol = new Map<ts.Symbol, number>();

	static getSymbolForReflection(reflection: SymbolBasedReflection) {
		return this._symbolsByReflectionId.get(reflection.id);
	}

	static getReflectionIdForSymbol(symbol: ts.Symbol) {
		return this._reflectionIdsBySymbol.get(symbol);
	}

	static async unknown(ctx: AnalyzeContext, symbol: ts.Symbol) {
		return new SymbolBasedReflection(symbol);
	}

	protected constructor(protected _symbol: ts.Symbol, registerReverse = true) {
		super();

		SymbolBasedReflection._symbolsByReflectionId.set(this.id, _symbol);
		if (registerReverse) {
			SymbolBasedReflection._reflectionIdsBySymbol.set(_symbol, this.id);
		}
	}

	get declarations() {
		return this._symbol.getDeclarations() ?? [];
	}

	get name() {
		return this._symbol.name;
	}
}
