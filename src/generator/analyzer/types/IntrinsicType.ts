import ts from 'typescript';
import type { IntrinsicReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { Type } from './Type';

export class IntrinsicType extends Type {
	constructor(private readonly _name: string) {
		super();
	}

	get name() {
		return this._name;
	}

	serialize(): IntrinsicReferenceType {
		return {
			type: 'intrinsic',
			name: this._name
		};
	}
}

const keywordToString = {
	[ts.SyntaxKind.AnyKeyword]: 'any',
	[ts.SyntaxKind.BigIntKeyword]: 'bigint',
	[ts.SyntaxKind.BooleanKeyword]: 'boolean',
	[ts.SyntaxKind.IntrinsicKeyword]: 'intrinsic',
	[ts.SyntaxKind.NeverKeyword]: 'never',
	[ts.SyntaxKind.NumberKeyword]: 'number',
	[ts.SyntaxKind.ObjectKeyword]: 'object',
	[ts.SyntaxKind.StringKeyword]: 'string',
	[ts.SyntaxKind.SymbolKeyword]: 'symbol',
	[ts.SyntaxKind.UndefinedKeyword]: 'undefined',
	[ts.SyntaxKind.UnknownKeyword]: 'unknown',
	[ts.SyntaxKind.VoidKeyword]: 'void'
};

export const intrinsicTypeReflector: TypeReflector<ts.KeywordTypeNode> = {
	kinds: [
		ts.SyntaxKind.AnyKeyword,
		ts.SyntaxKind.BigIntKeyword,
		ts.SyntaxKind.BooleanKeyword,
		ts.SyntaxKind.NeverKeyword,
		ts.SyntaxKind.NumberKeyword,
		ts.SyntaxKind.ObjectKeyword,
		ts.SyntaxKind.StringKeyword,
		ts.SyntaxKind.SymbolKeyword,
		ts.SyntaxKind.UndefinedKeyword,
		ts.SyntaxKind.UnknownKeyword,
		ts.SyntaxKind.VoidKeyword,
	],
	async fromNode(checker, node) {
		return new IntrinsicType(keywordToString[node.kind]);
	},
	async fromType(checker, type, node) {
		return new IntrinsicType(keywordToString[node.kind]);
	},
};
