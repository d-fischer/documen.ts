import type ts from 'typescript';

declare module 'typescript' {
	interface Node {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-qualifier
		symbol?: ts.Symbol;
	}
}
