import type ts from 'typescript';
import type { Project } from './Project';

export class AnalyzeContext {
	staticContext = false;

	constructor(public readonly project: Project, public readonly checker: ts.TypeChecker, public readonly packageName: string) {
	}
}
