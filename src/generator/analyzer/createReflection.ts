import assert from 'assert';
import path from 'path';
import * as ts from 'typescript';
import type { AnalyzeContext } from './AnalyzeContext';
import { AccessorReflection } from './reflections/AccessorReflection';
import { ClassReflection } from './reflections/ClassReflection';
import { EnumReflection } from './reflections/EnumReflection';
import { FunctionReflection } from './reflections/FunctionReflection';
import { InterfaceReflection } from './reflections/InterfaceReflection';
import { MethodReflection } from './reflections/MethodReflection';
import { ParameterReflection } from './reflections/ParameterReflection';
import { PropertyReflection } from './reflections/PropertyReflection';
import { ReferenceReflection } from './reflections/ReferenceReflection';
import type { Reflection } from './reflections/Reflection';
import { SymbolBasedReflection } from './reflections/SymbolBasedReflection';
import { TypeAliasReflection } from './reflections/TypeAliasReflection';
import { getSourceMapConsumer } from './util/sourceMaps';

export async function createReflection(ctx: AnalyzeContext, symbol: ts.Symbol, parentSymbol?: ts.Symbol): Promise<Reflection> {
	const declaration = symbol.getDeclarations()?.[0];
	assert(declaration);
	const declSf = declaration.getSourceFile();
	if (declSf.fileName.endsWith('.d.ts')) {
		const declFullText = declSf.getFullText();
		const endComments = ts.getLeadingCommentRanges(declFullText, declSf.endOfFileToken.getFullStart());
		const lastCommentRange = endComments?.pop();
		if (lastCommentRange) {
			const lastComment = declFullText.substring(lastCommentRange.pos, lastCommentRange.end);
			const mapUrlMatch = /^\/\/# sourceMappingURL=(.+)$/.exec(lastComment);
			const url = mapUrlMatch?.[1];
			if (url) {
				const consumer = await getSourceMapConsumer(path.dirname(declSf.fileName), url);
				const lac = declSf.getLineAndCharacterOfPosition(declaration.getStart());
				const origPos = consumer.originalPositionFor({
					line: lac.line + 1,
					column: lac.character
				});
				const fullPath = path.resolve(path.dirname(declSf.fileName), path.dirname(url), origPos.source!);
				const mappedId = ctx.project.findIdAtPosition(fullPath, origPos.line! - 1, origPos.column!);
				if (mappedId !== undefined) {
					return new ReferenceReflection(ctx, symbol, mappedId);
				}
			}
		}
	}

	if (ts.isInterfaceDeclaration(declaration)) {
		return InterfaceReflection.fromSymbol(ctx, symbol);
	}
	if (ts.isFunctionDeclaration(declaration)) {
		return FunctionReflection.fromSymbol(ctx, symbol);
	}
	if (ts.isClassDeclaration(declaration)) {
		return ClassReflection.fromSymbol(ctx, symbol);
	}
	if (ts.isMethodDeclaration(declaration) || ts.isMethodSignature(declaration)) {
		return MethodReflection.fromSymbol(ctx, symbol, parentSymbol);
	}
	if (ts.isAccessor(declaration)) {
		return AccessorReflection.fromSymbol(ctx, symbol);
	}
	if (ts.isTypeAliasDeclaration(declaration)) {
		return TypeAliasReflection.fromSymbol(ctx, symbol);
	}
	if (ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)) {
		return PropertyReflection.fromSymbol(ctx, symbol);
	}
	if (ts.isParameter(declaration)) {
		return ParameterReflection.fromSymbol(ctx, symbol, declaration);
	}
	if (ts.isEnumDeclaration(declaration)) {
		return EnumReflection.fromSymbol(ctx, symbol);
	}

	return SymbolBasedReflection.unknown(ctx, symbol);
}
