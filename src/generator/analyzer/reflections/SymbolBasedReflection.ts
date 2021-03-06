import type * as ts from 'typescript';
import type { AnalyzeContext } from '../AnalyzeContext';
import { Reflection } from './Reflection';

export class SymbolBasedReflection extends Reflection {
	static async unknown(ctx: AnalyzeContext, symbol: ts.Symbol) {
		return new SymbolBasedReflection(ctx, symbol);
	}

	protected constructor(ctx: AnalyzeContext, protected _symbol: ts.Symbol, registerReverse = true) {
		super(ctx);

		ctx.project.registerSymbol(this.id, _symbol, registerReverse);
	}

	get declarations() {
		return this._symbol.getDeclarations() ?? [];
	}

	get name() {
		const origName = this._symbol.name;
		const symbolMatch = /^__@(\w+)$/.exec(origName);
		if (!symbolMatch) {
			return origName;
		}

		return `[Symbol.${symbolMatch[1]}]`;
	}

	get symbol() {
		return this._symbol;
	}
}
