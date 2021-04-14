import ts from 'typescript';
import type { TypeReflector } from '../createType';
import { TypeLiteralReflection } from '../reflections/TypeLiteralReflection';
import { IntrinsicType } from './IntrinsicType';
import { ReflectionType } from './ReflectionType';

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
	},
};
