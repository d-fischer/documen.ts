import type * as ts from 'typescript';
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

	constructor(protected _symbol: ts.Symbol, registerReverse = true) {
		super();

		SymbolBasedReflection._symbolsByReflectionId.set(this.id, _symbol);
		if (registerReverse) {
			SymbolBasedReflection._reflectionIdsBySymbol.set(_symbol, this.id);
		}
	}

	get declarations() {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return this._symbol.declarations ?? [];
	}

	get name() {
		return this._symbol.name;
	}
}
