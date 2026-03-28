import assert from 'assert';
import * as ts from 'typescript';
import { zip } from '../../../common/tools/ArrayTools.js';
import type { AnalyzeContext } from '../AnalyzeContext.js';
import { SignatureReflection } from '../reflections/SignatureReflection.js';
import type { SymbolBasedReflection } from '../reflections/SymbolBasedReflection.js';

export async function getReflectedCallSignatures(
	ctx: AnalyzeContext,
	symbol: ts.Symbol,
	reflection: SymbolBasedReflection,
	parent?: SymbolBasedReflection
) {
	const locationDeclaration =
		parent?.symbol
			.getDeclarations()
			?.find(decl => ts.isClassDeclaration(decl) || ts.isInterfaceDeclaration(decl)) ??
		parent?.symbol.getDeclarations()?.[0]?.getSourceFile() ??
		symbol.getDeclarations()?.[0]?.getSourceFile();
	assert(locationDeclaration);

	const type = ctx.checker.getTypeOfSymbolAtLocation(symbol, locationDeclaration);

	const sigs = type.getCallSignatures();
	const declarations = symbol.getDeclarations()?.filter(ts.isFunctionLike) ?? [];
	return await Promise.all(
		[...zip(declarations, sigs)].map(
			async ([decl, sig]) =>
				await SignatureReflection.fromTsSignature(ctx, ts.SyntaxKind.CallSignature, sig, reflection, decl)
		)
	);
}
