import assert from 'assert';
import ts, { SyntaxKind } from 'typescript';
import type { ExternalPackageReference, ReferenceReferenceType } from '../../../common/reference';
import { findSourceMappedId } from '../createReflection';
import { createTypeFromNode, createTypeFromTsType, type TypeReflector } from '../createType';
import { resolvePromiseArray } from '../util/promises';
import { resolveAliasesForSymbol } from '../util/symbols';
import { ArrayType } from './ArrayType';
import { Type } from './Type';

export class ReferenceType extends Type {
	constructor(
		private readonly _name: string,
		private readonly _typeArguments?: Type[],
		private _id?: number,
		private _package?: string,
		private readonly _externalReference?: ExternalPackageReference,
		private readonly _isTypeParameter?: true
	) {
		super();
	}

	get name() {
		return this._name;
	}

	fixBrokenReference(id: number, pkg?: string) {
		this._id = id;
		this._package = pkg;
	}

	serialize(): ReferenceReferenceType {
		return {
			type: 'reference',
			name: this._name,
			id: this._id,
			package: this._package,
			typeArguments: this._typeArguments?.map(arg => arg.serialize()),
			externalReference: this._externalReference,
			isTypeParameter: this._isTypeParameter
		};
	}
}

export const referenceTypeReflector: TypeReflector<ts.TypeReferenceNode, ts.TypeReference> = {
	kinds: [ts.SyntaxKind.TypeReference],

	async fromNode(ctx, node) {
		const isArray =
			ctx.checker.typeToTypeNode(
				ctx.checker.getTypeAtLocation(node.typeName),
				void 0,
				ts.NodeBuilderFlags.IgnoreErrors
			)?.kind === ts.SyntaxKind.ArrayType;

		if (isArray) {
			return new ArrayType(await createTypeFromNode(ctx, node.typeArguments?.[0]));
		}

		const name = node.typeName.getText();

		const symbol = ctx.checker.getSymbolAtLocation(node.typeName)!;
		const origSymbol = resolveAliasesForSymbol(ctx, symbol);
		const declaration = origSymbol.declarations?.[0];
		assert(declaration);

		const reflectionIdForSymbol =
			(await findSourceMappedId(ctx, declaration)) ?? ctx.project.getReflectionIdForSymbol(origSymbol);
		const packageForSymbol = ctx.project.getPackageNameForReflectionId(reflectionIdForSymbol);

		// if no internal link found, try to interlink external packages
		const externalReference = reflectionIdForSymbol
			? undefined
			: ctx.project.findExternalPackageReference(declaration, origSymbol.name);

		const result = new ReferenceType(
			name,
			await resolvePromiseArray(
				node.typeArguments?.map(async typeNode => await createTypeFromNode(ctx, typeNode))
			),
			reflectionIdForSymbol,
			packageForSymbol,
			externalReference,
			// eslint-disable-next-line no-bitwise
			origSymbol.flags & ts.SymbolFlags.TypeParameter ? true : undefined
		);

		if (
			(reflectionIdForSymbol === undefined || packageForSymbol === undefined) &&
			externalReference === undefined
		) {
			ctx.project.registerBrokenReference(origSymbol, result);
		}

		return result;
	},
	async fromType(ctx, type) {
		const symbol = type.aliasSymbol ?? type.getSymbol();
		assert(symbol);
		const typeArgs = type.aliasSymbol ? type.aliasTypeArguments : type.typeArguments;
		const origSymbol = resolveAliasesForSymbol(ctx, symbol);
		const declaration = origSymbol.declarations?.[0];
		assert(declaration);
		const reflectionIdForSymbol =
			(await findSourceMappedId(ctx, declaration)) ?? ctx.project.getReflectionIdForSymbol(origSymbol);
		const packageForSymbol = ctx.project.getPackageNameForReflectionId(reflectionIdForSymbol);

		// if no internal link found, try to interlink external packages
		const externalReference = reflectionIdForSymbol
			? undefined
			: ctx.project.findExternalPackageReference(declaration, origSymbol.name);

		const result = new ReferenceType(
			symbol.name,
			await resolvePromiseArray(typeArgs?.map(async arg => await createTypeFromTsType(ctx, arg))),
			reflectionIdForSymbol,
			packageForSymbol,
			externalReference
		);

		if (
			(reflectionIdForSymbol === undefined || packageForSymbol === undefined) &&
			externalReference !== undefined
		) {
			ctx.project.registerBrokenReference(origSymbol, result);
		}

		return result;
	}
};

export const exprWithTypeArgsReflector: TypeReflector<ts.ExpressionWithTypeArguments> = {
	kinds: [SyntaxKind.ExpressionWithTypeArguments],
	async fromNode(ctx, node) {
		const symbol = ctx.checker.getSymbolAtLocation(node.expression);
		assert(symbol);
		const origSymbol = resolveAliasesForSymbol(ctx, symbol);
		const declaration = origSymbol.declarations?.[0];
		assert(declaration);
		const reflectionIdForSymbol =
			(await findSourceMappedId(ctx, declaration)) ?? ctx.project.getReflectionIdForSymbol(origSymbol);
		const packageForSymbol = ctx.project.getPackageNameForReflectionId(reflectionIdForSymbol);
		const result = new ReferenceType(
			origSymbol.name,
			await resolvePromiseArray(node.typeArguments?.map(async type => await createTypeFromNode(ctx, type))),
			reflectionIdForSymbol,
			packageForSymbol
		);

		if (reflectionIdForSymbol === undefined || packageForSymbol === undefined) {
			ctx.project.registerBrokenReference(origSymbol, result);
		}

		return result;
	}
};

export const importTypeReflector: TypeReflector<ts.ImportTypeNode> = {
	kinds: [SyntaxKind.ImportType],
	async fromNode(ctx, node) {
		const name = node.qualifier?.getText() ?? '[module]';
		const symbol = ctx.checker.getSymbolAtLocation(node);
		assert(symbol);
		const origSymbol = resolveAliasesForSymbol(ctx, symbol);

		const declaration = origSymbol.declarations?.[0];
		assert(declaration);
		const reflectionIdForSymbol =
			(await findSourceMappedId(ctx, declaration)) ?? ctx.project.getReflectionIdForSymbol(origSymbol);
		const packageForSymbol = ctx.project.getPackageNameForReflectionId(reflectionIdForSymbol);

		// if no internal link found, try to interlink external packages
		const externalReference = reflectionIdForSymbol
			? undefined
			: ctx.project.findExternalPackageReference(declaration, origSymbol.name);

		const result = new ReferenceType(
			name,
			await resolvePromiseArray(
				node.typeArguments?.map(async typeNode => await createTypeFromNode(ctx, typeNode))
			),
			reflectionIdForSymbol,
			packageForSymbol,
			externalReference,
			// eslint-disable-next-line no-bitwise
			origSymbol.flags & ts.SymbolFlags.TypeParameter ? true : undefined
		);

		if (
			(reflectionIdForSymbol === undefined || packageForSymbol === undefined) &&
			externalReference === undefined
		) {
			ctx.project.registerBrokenReference(origSymbol, result);
		}

		return result;
	},
	async fromType(ctx, type) {
		const symbol = type.getSymbol();
		assert(symbol);
		const typeArgs = type.aliasSymbol && type.aliasTypeArguments;
		const origSymbol = resolveAliasesForSymbol(ctx, symbol);
		const declaration = origSymbol.declarations?.[0];
		assert(declaration);
		const reflectionIdForSymbol =
			(await findSourceMappedId(ctx, declaration)) ?? ctx.project.getReflectionIdForSymbol(origSymbol);
		const packageForSymbol = ctx.project.getPackageNameForReflectionId(reflectionIdForSymbol);

		// if no internal link found, try to interlink external packages
		const externalReference = reflectionIdForSymbol
			? undefined
			: ctx.project.findExternalPackageReference(declaration, origSymbol.name);

		const result = new ReferenceType(
			symbol.name,
			await resolvePromiseArray(typeArgs?.map(async arg => await createTypeFromTsType(ctx, arg))),
			reflectionIdForSymbol,
			packageForSymbol,
			externalReference
		);

		if (
			(reflectionIdForSymbol === undefined || packageForSymbol === undefined) &&
			externalReference !== undefined
		) {
			ctx.project.registerBrokenReference(origSymbol, result);
		}

		return result;
	}
};
