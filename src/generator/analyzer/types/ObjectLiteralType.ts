import ts from 'typescript';
import type { TypeReflector } from '../createType.js';
import { TypeLiteralReflection } from '../reflections/TypeLiteralReflection.js';
import { IntrinsicType } from './IntrinsicType.js';
import { ReflectionType } from './ReflectionType.js';

export const objectLiteralTypeReflector: TypeReflector<ts.TypeLiteralNode> = {
	kinds: [ts.SyntaxKind.TypeLiteral],
	async fromNode(ctx, node) {
		const symbol = ctx.checker.getSymbolAtLocation(node) ?? node.symbol;
		const type = ctx.checker.getTypeAtLocation(node);
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!symbol || !type) {
			return new IntrinsicType('Object');
		}

		return new ReflectionType(await TypeLiteralReflection.fromTsType(ctx, type));
	},
	async fromType(ctx, type) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!type.symbol) {
			return new IntrinsicType('Object');
		}

		return new ReflectionType(await TypeLiteralReflection.fromTsType(ctx, type));
	}
};
