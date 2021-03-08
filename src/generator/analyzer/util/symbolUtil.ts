import * as ts from 'typescript';

export function resolveAliasesForSymbol(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol;
export function resolveAliasesForSymbol(checker: ts.TypeChecker, symbol: ts.Symbol | undefined): ts.Symbol | undefined;
export function resolveAliasesForSymbol(checker: ts.TypeChecker, symbol: ts.Symbol | undefined): ts.Symbol | undefined {
	// eslint-disable-next-line no-bitwise
	while (symbol && symbol.flags & ts.SymbolFlags.Alias) {
		symbol = checker.getAliasedSymbol(symbol);
	}

	return symbol;
}

export function nodeToSymbol(checker: ts.TypeChecker, node: ts.Node): ts.Symbol {
	const localSymbol = checker.getSymbolAtLocation(node)!;
	return resolveAliasesForSymbol(checker, localSymbol);
}
