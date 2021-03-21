import assert from 'assert';
import * as ts from 'typescript';
import { zip } from '../../../common/tools/ArrayTools';
import type { AnalyzeContext } from '../AnalyzeContext';
import { SignatureReflection } from '../reflections/SignatureReflection';
import type { SymbolBasedReflection } from '../reflections/SymbolBasedReflection';

export async function getReflectedCallSignatures(ctx: AnalyzeContext, symbol: ts.Symbol, reflection: SymbolBasedReflection, parentSymbol?: ts.Symbol) {
	const locationDeclaration = parentSymbol?.getDeclarations()?.find(
		decl => ts.isClassDeclaration(decl) || ts.isInterfaceDeclaration(decl)
		)
		?? parentSymbol?.getDeclarations()?.[0]?.getSourceFile()
		?? symbol.getDeclarations()?.[0]?.getSourceFile();
	assert(locationDeclaration);

	const type = ctx.checker.getTypeOfSymbolAtLocation(symbol, locationDeclaration);

	const sigs = type.getCallSignatures()
	const declarations = symbol.getDeclarations()?.filter(ts.isFunctionLike) ?? [];
	return Promise.all([...zip(declarations, sigs)].map(async ([decl, sig]) => SignatureReflection.fromTsSignature(ctx, reflection, ts.SyntaxKind.CallSignature, sig, decl)));
}
