import * as ts from 'typescript';
import type { AnalyzeContext } from '../AnalyzeContext';

export function resolveAliasesForSymbol(ctx: AnalyzeContext, symbol: ts.Symbol): ts.Symbol;
export function resolveAliasesForSymbol(ctx: AnalyzeContext, symbol: ts.Symbol | undefined): ts.Symbol | undefined;
export function resolveAliasesForSymbol(ctx: AnalyzeContext, symbol: ts.Symbol | undefined): ts.Symbol | undefined {
	// eslint-disable-next-line no-bitwise
	while (symbol && symbol.flags & ts.SymbolFlags.Alias) {
		symbol = ctx.checker.getAliasedSymbol(symbol);
	}

	return symbol;
}

export function nodeToSymbol(ctx: AnalyzeContext, node: ts.Node): ts.Symbol {
	const localSymbol = ctx.checker.getSymbolAtLocation(node)!;
	return resolveAliasesForSymbol(ctx, localSymbol);
}
