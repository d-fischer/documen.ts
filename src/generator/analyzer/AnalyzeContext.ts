import type ts from 'typescript';

export class AnalyzeContext {
	constructor(public readonly checker: ts.TypeChecker, public readonly packageName: string) {
	}
}
