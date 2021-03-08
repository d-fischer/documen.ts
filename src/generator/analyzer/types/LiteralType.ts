import ts from 'typescript';
import type { LiteralReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { Type } from './Type';

export type LiteralValue = boolean | number | string | null | bigint;

export class LiteralType extends Type {
	constructor(private readonly _value: LiteralValue) {
		super();
	}

	get value() {
		return this._value;
	}

	serialize(): LiteralReferenceType {
		return {
			type: 'literal',
			value: typeof this._value === 'bigint' ? this._value.toString() : JSON.stringify(this._value)
		};
	}
}

export const literalTypeReflector: TypeReflector<ts.LiteralTypeNode, ts.LiteralType> = {
	kinds: [ts.SyntaxKind.LiteralType],
	fromNode(checker, node) {
		switch (node.literal.kind) {
			case ts.SyntaxKind.TrueKeyword:
			case ts.SyntaxKind.FalseKeyword: {
				return new LiteralType(node.literal.kind === ts.SyntaxKind.TrueKeyword);
			}
			case ts.SyntaxKind.NumericLiteral: {
				return new LiteralType(Number(node.literal.text));
			}
			case ts.SyntaxKind.StringLiteral: {
				return new LiteralType(node.literal.text);
			}
			case ts.SyntaxKind.NullKeyword: {
				return new LiteralType(null);
			}
			case ts.SyntaxKind.BigIntLiteral: {
				return new LiteralType(BigInt(node.literal.getText().replace('n', '')));
			}
			case ts.SyntaxKind.PrefixUnaryExpression: {
				const operand = (node.literal as ts.PrefixUnaryExpression).operand;
				switch (operand.kind) {
					case ts.SyntaxKind.NumericLiteral:
						return new LiteralType(Number(node.literal.getText()));
					case ts.SyntaxKind.BigIntLiteral:
						return new LiteralType(BigInt(node.literal.getText().replace('n', '')));
					default:
						throw new Error(`unsupported unary prefix literal: ${node.literal.getText()}`);
				}
			}
			case ts.SyntaxKind.NoSubstitutionTemplateLiteral: {
				return new LiteralType(node.literal.text);
			}
			default: {
				throw new Error(`unsupported literal: ${node.literal.getText()}`);
			}
		}
	},
	fromType(checker, type, node) {
		switch (node.literal.kind) {
			case ts.SyntaxKind.TrueKeyword:
			case ts.SyntaxKind.FalseKeyword: {
				return new LiteralType(node.literal.kind === ts.SyntaxKind.TrueKeyword);
			}
			case ts.SyntaxKind.NumericLiteral: {
				return new LiteralType(+node.literal.text);
			}
			case ts.SyntaxKind.StringLiteral: {
				return new LiteralType(node.literal.text);
			}
			case ts.SyntaxKind.NullKeyword: {
				return new LiteralType(null);
			}
			default: {
				if (typeof type.value === 'object') {
					return new LiteralType(BigInt(`${type.value.negative ? '-' : ''}${type.value.base10Value}`));
				}

				return new LiteralType(type.value);
			}
		}
	}
};
