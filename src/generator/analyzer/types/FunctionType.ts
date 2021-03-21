import ts from 'typescript';
import type { TypeReflector } from '../createType';
import { createTypeFromNode } from '../createType';
import { ParameterReflection } from '../reflections/ParameterReflection';
import { SignatureReflection } from '../reflections/SignatureReflection';
import { TypeLiteralReflection } from '../reflections/TypeLiteralReflection';
import { IntrinsicType } from './IntrinsicType';
import { ReflectionType } from './ReflectionType';

export const functionTypeReflector: TypeReflector<ts.FunctionTypeNode> = {
	kinds: [ts.SyntaxKind.FunctionType],
	async fromNode(ctx, node) {
		const symbol = ctx.checker.getSymbolAtLocation(node) ?? node.symbol;
		const type = ctx.checker.getTypeAtLocation(node);
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!symbol || !type) {
			return new IntrinsicType('Function');
		}

		const params = await Promise.all(node.parameters.map(async param => ParameterReflection.fromNode(ctx, param)));
		const returnType = await createTypeFromNode(ctx, node.type);
		const signature = await SignatureReflection.fromParts(ctx, ts.SyntaxKind.CallSignature, params, returnType);

		const literalReflection = new TypeLiteralReflection(undefined, [signature]);

		return new ReflectionType(literalReflection);
	},
	async fromType(checker, type) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!type.symbol) {
			return new IntrinsicType('Function');
		}

		const literalReflection = new TypeLiteralReflection(undefined, [await SignatureReflection.fromTsSignature(checker, ts.SyntaxKind.CallSignature, type.getCallSignatures()[0])]);

		return new ReflectionType(literalReflection);
	},
};
