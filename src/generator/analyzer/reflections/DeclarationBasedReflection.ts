import type * as ts from 'typescript';
import { Reflection } from './Reflection';

export abstract class DeclarationBasedReflection<T extends ts.Declaration> extends Reflection {
	constructor(protected _declaration: T) {
		super();
	}

	get declarations() {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return [this._declaration];
	}
}
