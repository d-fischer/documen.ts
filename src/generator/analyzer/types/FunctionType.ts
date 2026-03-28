import ts from 'typescript';
import { createTypeFromNode, type TypeReflector } from '../createType.js';
import { ParameterReflection } from '../reflections/ParameterReflection.js';
import { SignatureReflection } from '../reflections/SignatureReflection.js';
import { TypeLiteralReflection } from '../reflections/TypeLiteralReflection.js';
import { IntrinsicType } from './IntrinsicType.js';
import { ReflectionType } from './ReflectionType.js';

export const functionTypeReflector: TypeReflector<ts.FunctionTypeNode> = {
	kinds: [ts.SyntaxKind.FunctionType],
	async fromNode(ctx, node) {
		const symbol = ctx.checker.getSymbolAtLocation(node) ?? node.symbol;
		const type = ctx.checker.getTypeAtLocation(node);
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!symbol || !type) {
			return new IntrinsicType('Function');
		}

		const params = await Promise.all(
			node.parameters.map(async param => await ParameterReflection.fromNode(ctx, param))
		);
		const returnType = await createTypeFromNode(ctx, node.type);
		const signature = await SignatureReflection.fromParts(ctx, ts.SyntaxKind.CallSignature, params, returnType);

		const literalReflection = TypeLiteralReflection.fromParts(ctx, undefined, [signature]);

		return new ReflectionType(literalReflection);
	},
	async fromType(ctx, type) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!type.symbol) {
			return new IntrinsicType('Function');
		}

		const literalReflection = TypeLiteralReflection.fromParts(ctx, undefined, [
			await SignatureReflection.fromTsSignature(ctx, ts.SyntaxKind.CallSignature, type.getCallSignatures()[0])
		]);

		return new ReflectionType(literalReflection);
	}
};
