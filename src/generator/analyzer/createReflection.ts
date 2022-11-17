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

export async function findSourceMappedId(
	ctx: AnalyzeContext,
	declaration: ts.Declaration
): Promise<number | undefined> {
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
				if (origPos.source) {
					const fullPath = path.resolve(path.dirname(declSf.fileName), path.dirname(url), origPos.source);
					return ctx.project.findIdAtPosition(fullPath, origPos.line! - 1, origPos.column!);
				}
			}
		}
	}

	return undefined;
}

export async function createReflectionInternal(
	ctx: AnalyzeContext,
	symbol: ts.Symbol,
	parent?: Reflection
): Promise<Reflection> {
	const declaration = symbol.getDeclarations()?.[0];
	assert(declaration);

	const sourceMappedId = await findSourceMappedId(ctx, declaration);
	if (sourceMappedId !== undefined) {
		return new ReferenceReflection(ctx, symbol, sourceMappedId);
	}

	if (ts.isInterfaceDeclaration(declaration)) {
		return await InterfaceReflection.fromSymbol(ctx, symbol);
	}
	if (ts.isFunctionDeclaration(declaration)) {
		return await FunctionReflection.fromSymbol(ctx, symbol);
	}
	if (ts.isClassDeclaration(declaration)) {
		return await ClassReflection.fromSymbol(ctx, symbol);
	}
	if (ts.isMethodDeclaration(declaration) || ts.isMethodSignature(declaration)) {
		return await MethodReflection.fromSymbol(ctx, symbol, parent as SymbolBasedReflection);
	}
	if (ts.isAccessor(declaration)) {
		return await AccessorReflection.fromSymbol(ctx, symbol, parent as SymbolBasedReflection);
	}
	if (ts.isTypeAliasDeclaration(declaration)) {
		return await TypeAliasReflection.fromSymbol(ctx, symbol);
	}
	if (
		ts.isPropertyDeclaration(declaration) ||
		ts.isPropertySignature(declaration) ||
		// eslint-disable-next-line no-bitwise
		symbol.flags & ts.SymbolFlags.Property
	) {
		return await PropertyReflection.fromSymbol(ctx, symbol, parent as SymbolBasedReflection);
	}
	if (ts.isParameter(declaration)) {
		return await ParameterReflection.fromSymbol(ctx, symbol, declaration);
	}
	if (ts.isEnumDeclaration(declaration)) {
		return await EnumReflection.fromSymbol(ctx, symbol);
	}

	return await SymbolBasedReflection.unknown(ctx, symbol);
}

export async function createReflection(
	ctx: AnalyzeContext,
	symbol: ts.Symbol,
	parent?: Reflection
): Promise<Reflection> {
	const reflection = await createReflectionInternal(ctx, symbol, parent);
	ctx.project.registerForPackageName(ctx.packageName, reflection);

	return reflection;
}
