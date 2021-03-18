import assert from 'assert';
import path from 'path';
import * as ts from 'typescript';
import { AccessorReflection } from './reflections/AccessorReflection';
import { ClassReflection } from './reflections/ClassReflection';
import { EnumReflection } from './reflections/EnumReflection';
import { FunctionReflection } from './reflections/FunctionReflection';
import { InterfaceReflection } from './reflections/InterfaceReflection';
import { MethodReflection } from './reflections/MethodReflection';
import { ParameterReflection } from './reflections/ParameterReflection';
import { PropertyReflection } from './reflections/PropertyReflection';
import { ReferenceReflection } from './reflections/ReferenceReflection';
import { Reflection } from './reflections/Reflection';
import { SymbolBasedReflection } from './reflections/SymbolBasedReflection';
import { TypeAliasReflection } from './reflections/TypeAliasReflection';
import { getSourceMapConsumer } from './util/sourceMaps';

export async function createReflection(checker: ts.TypeChecker, symbol: ts.Symbol, parentSymbol?: ts.Symbol): Promise<Reflection> {
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
				const mappedId = Reflection.findIdAtPosition(fullPath, origPos.line! - 1, origPos.column!);
				if (mappedId !== undefined) {
					return new ReferenceReflection(symbol, mappedId);
				}
			}
		}
	}

	if (ts.isInterfaceDeclaration(declaration)) {
		const rs = new InterfaceReflection(symbol);
		await rs.processChildren(checker);
		return rs;
	}
	if (ts.isFunctionDeclaration(declaration)) {
		const rs = new FunctionReflection(symbol);
		await rs.processChildren(checker);
		return rs;
	}
	if (ts.isClassDeclaration(declaration)) {
		const rs = new ClassReflection(symbol);
		await rs.processChildren(checker);
		return rs;
	}
	if (ts.isMethodDeclaration(declaration) || ts.isMethodSignature(declaration)) {
		const rs = new MethodReflection(symbol, parentSymbol);
		await rs.processChildren(checker);
		return rs;
	}
	if (ts.isAccessor(declaration)) {
		const rs = new AccessorReflection(symbol);
		await rs.processChildren(checker);
		return rs;
	}
	if (ts.isTypeAliasDeclaration(declaration)) {
		const rs = new TypeAliasReflection(symbol);
		await rs.processChildren(checker);
		return rs;
	}
	if (ts.isPropertyDeclaration(declaration)) {
		const rs = new PropertyReflection(symbol);
		await rs.processChildren(checker);
		return rs;
	}
	if (ts.isParameter(declaration)) {
		return ParameterReflection.fromSymbol(checker, symbol, declaration);
	}
	if (ts.isEnumDeclaration(declaration)) {
		const rs = new EnumReflection(symbol);
		await rs.processChildren(checker);
		return rs;
	}

	const rs = new SymbolBasedReflection(symbol);
	await rs.processChildren(checker);
	return rs;
}
