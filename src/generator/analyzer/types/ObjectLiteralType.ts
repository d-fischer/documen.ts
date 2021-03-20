import ts from 'typescript';
import { createReflection } from '../createReflection';
import type { TypeReflector } from '../createType';
import { SignatureReflection } from '../reflections/SignatureReflection';
import { TypeLiteralReflection } from '../reflections/TypeLiteralReflection';
import { resolvePromiseArray } from '../util/promises';
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

		const members = await resolvePromiseArray(ctx.checker.getPropertiesOfType(type).map(async prop => createReflection(ctx, prop, symbol)));
		const signatures = await resolvePromiseArray(type.getCallSignatures().map(async sig => SignatureReflection.fromTsSignature(ctx, '__type', ts.SyntaxKind.CallSignature, sig)));

		const literalReflection = new TypeLiteralReflection(members, signatures);

		return new ReflectionType(literalReflection);
	},
	async fromType(ctx, type) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!type.symbol) {
			return new IntrinsicType('Object');
		}

		const members = await resolvePromiseArray(ctx.checker.getPropertiesOfType(type).map(async prop => createReflection(ctx, prop, type.symbol)));
		const signatures = await resolvePromiseArray(type.getCallSignatures().map(async sig => SignatureReflection.fromTsSignature(ctx, '__type', ts.SyntaxKind.CallSignature, sig)));

		const literalReflection = new TypeLiteralReflection(members, signatures);

		return new ReflectionType(literalReflection);
	},
};
