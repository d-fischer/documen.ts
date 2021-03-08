import ts from 'typescript';

export function stringifyExpression(expression: ts.Expression): string | undefined {
	switch (expression.kind) {
		case ts.SyntaxKind.TrueKeyword:
		case ts.SyntaxKind.FalseKeyword:
		case ts.SyntaxKind.NumericLiteral:
		case ts.SyntaxKind.StringLiteral:
		case ts.SyntaxKind.NullKeyword:
		case ts.SyntaxKind.PrefixUnaryExpression: {
			return expression.getText();
		}
		default:
			return '<complex>';
	}
}
