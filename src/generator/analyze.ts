/// <reference lib="es2019" />

/* eslint-disable no-console,max-classes-per-file */
import assert from 'assert';
import { promises as fs } from 'fs';
import * as path from 'path';
import { SourceMapConsumer } from 'source-map';
import * as ts from 'typescript';
import * as tsutils from 'tsutils';
import type {
	ClassReferenceNode,
	ConstructorReferenceNode,
	FunctionReferenceNode,
	InterfaceReferenceNode,
	MethodReferenceNode,
	ParameterReferenceNode,
	ReferenceLocation,
	ReferenceNode,
	ReferenceReferenceNode,
	SignatureReferenceNode
} from '../common/reference';
import { zip } from '../common/tools/ArrayTools';

export function exit(exitCode: number): never {
	if (exitCode) {
		console.error(`Process exiting with error code '${exitCode}'.`);
	}
	process.exit(exitCode);
}

function formatDiagnostics(diagnostics: readonly ts.Diagnostic[], host: ts.CompilerHost) {
	const shouldBePretty = !!ts.sys.writeOutputIsTTY?.();
	const formatHost: ts.FormatDiagnosticsHost = {
		getCanonicalFileName(fileName: string) {
			return host.getCanonicalFileName(fileName);
		},
		getCurrentDirectory() {
			return host.getCurrentDirectory();
		},
		getNewLine() {
			return host.getNewLine();
		}
	};
	if (shouldBePretty) {
		return ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost);
	}
	return ts.formatDiagnostics(diagnostics, formatHost);
}

function handleDiagnostics(
	diagnostics: readonly ts.Diagnostic[],
	host: ts.CompilerHost,
	errorPrefix = 'Unknown error'
) {
	if (diagnostics.length) {
		process.stderr.write('\n\n');
		console.error(formatDiagnostics(diagnostics, host));
		console.error(`${errorPrefix}. Exiting.`);
		exit(1);
	}
}

function handleConfigParsingErrors(parsedCommandLine: ts.ParsedCommandLine | undefined, host: ts.CompilerHost) {
	if (!parsedCommandLine) {
		process.stderr.write('\n\n');
		console.error('Unknown error parsing config.');
		exit(1);
	}
	if (parsedCommandLine.errors.length) {
		process.stderr.write('\n\n');
		console.error(formatDiagnostics(parsedCommandLine.errors, host));
		exit(1);
	}
}

function parseConfig(configFilePath: string) {
	const tempCompilerHost = ts.createCompilerHost({}, false);
	// from here https://github.com/Microsoft/TypeScript/blob/6fb0f6818ad48bf4f685e86c03405ddc84b530ed/src/compiler/program.ts#L2812
	const configParsingHost: ts.ParseConfigFileHost = {
		fileExists: f => tempCompilerHost.fileExists(f),
		readDirectory: (root, extensions, includes, depth?) =>
			tempCompilerHost.readDirectory ? tempCompilerHost.readDirectory(root, extensions, includes, depth) : [],
		readFile: f => tempCompilerHost.readFile(f),
		useCaseSensitiveFileNames: tempCompilerHost.useCaseSensitiveFileNames(),
		getCurrentDirectory: () => tempCompilerHost.getCurrentDirectory(),
		onUnRecoverableConfigFileDiagnostic: () => undefined
	};
	const parsedConfig = ts.getParsedCommandLineOfConfigFile(
		configFilePath,
		{},
		{
			...configParsingHost,
			onUnRecoverableConfigFileDiagnostic(d) {
				handleDiagnostics([d], tempCompilerHost);
			}
		}
	)!;

	handleConfigParsingErrors(parsedConfig, tempCompilerHost);

	return parsedConfig;
}

function resolveAliasesForSymbol(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol;
function resolveAliasesForSymbol(checker: ts.TypeChecker, symbol: ts.Symbol | undefined): ts.Symbol | undefined;
function resolveAliasesForSymbol(checker: ts.TypeChecker, symbol: ts.Symbol | undefined): ts.Symbol | undefined {
	// eslint-disable-next-line no-bitwise
	while (symbol && symbol.flags & ts.SymbolFlags.Alias) {
		symbol = checker.getAliasedSymbol(symbol);
	}

	return symbol;
}

function nodeToSymbol(checker: ts.TypeChecker, node: ts.Node): ts.Symbol {
	const localSymbol = checker.getSymbolAtLocation(node)!;
	return resolveAliasesForSymbol(checker, localSymbol);
}

const consumers = new Map<string, SourceMapConsumer>();

async function getSourceMapConsumer(baseFileName: string, mapUrl: string) {
	const absolutePath = path.resolve(baseFileName, mapUrl);

	if (consumers.has(absolutePath)) {
		return consumers.get(absolutePath)!;
	}

	const mapContents = await fs.readFile(absolutePath, 'utf8');
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const newConsumer = (await new SourceMapConsumer(mapContents)) as SourceMapConsumer;
	consumers.set(absolutePath, newConsumer);

	return newConsumer;
}

const rootSymbols = new Map<number, Reflection>();

abstract class Reflection {
	private static readonly _reflectionsById = new Map<number, Reflection>();
	private static _nextReflectionId = 1;
	readonly id: number;

	static findIdAtPosition(fullPath: string, line: number, column: number): number | undefined {
		for (const [id, rs] of this._reflectionsById) {
			const declarations = rs.declarations;
			for (const declaration of declarations) {
				const declSf = declaration.getSourceFile();
				if (declSf.fileName !== fullPath) {
					continue;
				}
				const pos = declSf.getPositionOfLineAndCharacter(line, column);

				if (pos === declaration.getStart()) {
					return id;
				}
			}
		}

		return undefined;
	}

	constructor() {
		this.id = this._registerReflection();
	}

	/** @internal */
	static get reflectionsById() {
		return this._reflectionsById;
	}

	/** @internal */
	abstract get declarations(): ts.Declaration[];

	// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
	async processChildren(checker: ts.TypeChecker) {
	}

	serialize(): ReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'unknown',
		} as unknown as ReferenceNode;
	}

	abstract get name(): string;

	protected _baseSerialize(): Omit<ReferenceNode, 'kind'> & { kind: 'unknown' } {
		const node = this.declarations[0];
		const sf = node.getSourceFile();
		const { fileName } = sf;
		const pos = node.getStart();
		const { character, line } = sf.getLineAndCharacterOfPosition(pos);
		const location: ReferenceLocation = {
			fileName,
			line: line + 1,
			character
		};

		return {
			id: this.id,
			kind: 'unknown',
			name: this.name,
			location
		};
	}

	private _registerReflection(): number {
		const id = Reflection._nextReflectionId++;
		Reflection._reflectionsById.set(id, this);
		return id;
	}
}

class SymbolBasedReflection extends Reflection {
	private static readonly _symbolsByReflectionId = new Map<number, ts.Symbol>();
	private static readonly _reflectionIdsBySymbol = new Map<ts.Symbol, number>();

	static getSymbolForReflection(reflection: SymbolBasedReflection) {
		return this._symbolsByReflectionId.get(reflection.id);
	}

	static getReflectionIdForSymbol(symbol: ts.Symbol) {
		return this._reflectionIdsBySymbol.get(symbol);
	}

	constructor(protected _symbol: ts.Symbol) {
		super();

		SymbolBasedReflection._symbolsByReflectionId.set(this.id, _symbol);
		SymbolBasedReflection._reflectionIdsBySymbol.set(_symbol, this.id);
	}

	get declarations() {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return this._symbol.declarations ?? [];
	}

	get name() {
		return this._symbol.name;
	}
}

abstract class DeclarationBasedReflection<T extends ts.Declaration> extends Reflection {
	constructor(protected _declaration: T) {
		super();
	}

	get declarations() {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return [this._declaration];
	}
}

class ConstructorReflection extends SymbolBasedReflection {
	serialize(): ConstructorReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'constructor',
			signatures: []
		};
	}
}

class ReferenceReflection extends SymbolBasedReflection {
	constructor(symbol: ts.Symbol, private readonly _targetId: number) {
		super(symbol);
	}

	serialize(): ReferenceReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'reference',
			target: this._targetId
		};
	}
}

class InterfaceReflection extends SymbolBasedReflection {
	serialize(): InterfaceReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'interface'
		};
	}
}

class FunctionReflection extends SymbolBasedReflection {
	serialize(): FunctionReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'function'
		};
	}
}

class ClassReflection extends SymbolBasedReflection {
	ctor?: ConstructorReflection;
	members!: Reflection[];

	async processChildren(checker: ts.TypeChecker) {
		const instanceType = checker.getDeclaredTypeOfSymbol(this._symbol);
		assert(instanceType.isClassOrInterface());
		const members = checker.getPropertiesOfType(instanceType);
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		this.members = await Promise.all(members.map(async member => createReflection(checker, member)));
	}

	serialize(): ClassReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'class',
			ctor: this.ctor?.serialize(),
			members: this.members.map(m => m.serialize())
		};
	}
}

class ParameterReflection extends DeclarationBasedReflection<ts.ParameterDeclaration> {
	serialize(): ParameterReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'parameter',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/naming-convention,@typescript-eslint/no-unsafe-assignment
			type: { __unhandled: this._declaration.type?.getText() } as any
		};
	}

	get name() {
		return this._declaration.name.getText();
	}
}

class CallSignatureReflection extends DeclarationBasedReflection<ts.SignatureDeclaration> {
	params!: ParameterReflection[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	returnType!: any;

	constructor(private readonly _parent: SymbolBasedReflection, declaration: ts.SignatureDeclaration, private readonly _signature: ts.Signature) {
		super(declaration);
	}

	async processChildren(checker: ts.TypeChecker) {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		this.params = await Promise.all(this._declaration.parameters.map(async param => {
			assert(ts.isParameter(param));
			const declSym = new ParameterReflection(param);
			await declSym.processChildren(checker);
			return declSym;
		}));

		const returnType = this._signature.getReturnType();
		const returnTypeNode = checker.typeToTypeNode(returnType, undefined, ts.NodeBuilderFlags.IgnoreErrors);
		assert(returnTypeNode);
		if (tsutils.isTypeReference(returnType)) {
			const symbol = returnType.aliasSymbol ?? returnType.getSymbol();
			assert(symbol);
			const origSymbol = resolveAliasesForSymbol(checker, symbol);
			this.returnType = {
				type: 'reference',
				name: symbol.name,
				id: SymbolBasedReflection.getReflectionIdForSymbol(origSymbol)
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			this.returnType = { __unhandled: this._declaration.type?.getText() };
		}
	}

	get name() {
		return this._parent.name;
	}

	serialize(): SignatureReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'callSignature',
			parameters: this.params.map(param => param.serialize()),
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			type: this.returnType
		};
	}
}

class MethodReflection extends SymbolBasedReflection {
	signatures!: CallSignatureReflection[];

	constructor(symbol: ts.Symbol, private readonly _parentSymbol?: ts.Symbol) {
		super(symbol);
	}

	async processChildren(checker: ts.TypeChecker) {
		const sigs = this._getCallSignatures(checker);
		const declarations = this._symbol.getDeclarations()?.filter(ts.isFunctionLike) ?? [];
		this.signatures = await Promise.all([...zip(declarations, sigs)].map(async ([decl, sig]) => {
			const declSym = new CallSignatureReflection(this, decl, sig);
			await declSym.processChildren(checker);
			return declSym;
		}));
	}

	serialize(): MethodReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'method',
			signatures: this.signatures.map(sig => sig.serialize())
		};
	}

	private get _locationDeclaration() {
		const result = this._parentSymbol?.getDeclarations()?.find(
			decl => ts.isClassDeclaration(decl) || ts.isInterfaceDeclaration(decl)
			)
			?? this._parentSymbol?.getDeclarations()?.[0]?.getSourceFile()
			?? this._symbol.getDeclarations()?.[0]?.getSourceFile();
		assert(result);

		return result;
	}

	private _getCallSignatures(checker: ts.TypeChecker) {
		const type = checker.getTypeOfSymbolAtLocation(this._symbol, this._locationDeclaration);

		return type.getCallSignatures();
	}
}

async function createReflection(checker: ts.TypeChecker, symbol: ts.Symbol, parentSymbol?: ts.Symbol): Promise<Reflection> {
	const declaration = symbol.declarations[0];
	const declSf = declaration.getSourceFile();
	if (declSf.fileName.endsWith('.d.ts')) {
		console.error('[external]');
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
	if (ts.isMethodDeclaration(declaration)) {
		const rs = new MethodReflection(symbol, parentSymbol);
		await rs.processChildren(checker);
		return rs;
	}

	const rs = new SymbolBasedReflection(symbol);
	await rs.processChildren(checker);
	return rs;
}

async function analyzePackage(name: string) {
	const parsedConfig = parseConfig(`packages/${name}/tsconfig.json`);
	const { options, fileNames } = parsedConfig;
	const prog = ts.createProgram({
		options,
		rootNames: fileNames
	});
	const checker = prog.getTypeChecker();
	const sf = prog.getSourceFile(path.join(process.cwd(), 'packages', name, 'src', 'index.ts'))!;
	const children = sf.statements;
	const fileExports = children
		.filter((child): child is ts.ExportDeclaration => ts.isExportDeclaration(child))
		.flatMap(expDecl => {
			const clause = expDecl.exportClause!;
			if (ts.isNamedExports(clause)) {
				return clause.elements;
			} else {
				throw new Error(`Namespace exports not supported yet (file: ${expDecl.getSourceFile().fileName})`);
			}
		})
		.map(exp => {
			const id = exp.name;
			return nodeToSymbol(checker, id);
		});

	for (const sym of fileExports) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (sym.declarations?.length !== 1) {
			console.error(`Multiple or no declarations found in symbol ${sym.name}`);
		}
		const s = await createReflection(checker, sym);
		console.error(`id: ${s.id}`);
		rootSymbols.set(s.id, s);

		const [declaration] = sym.declarations;

		if (ts.isInterfaceDeclaration(declaration)) {
			console.error('found interface', declaration.name.getText());
			for (const member of declaration.members) {
				console.error('> found member', member.name?.getText());
			}
		} else if (ts.isFunctionDeclaration(declaration)) {
			console.error('found function', declaration.name?.getText());
			for (const param of declaration.parameters) {
				console.error('> found param', param.name.getText());
			}
		} else if (ts.isClassDeclaration(declaration)) {
			console.error('found class', declaration.name?.getText());
			for (const member of declaration.members) {
				console.error('> found member', ts.isConstructorDeclaration(member) ? '<constructor>' : member.name?.getText());
			}
		} else {
			console.error('found unknown declaration', sym.name);
		}

		console.error('');
	}

	// console.error(fileExports);
}

async function main() {
	await analyzePackage('twitch-common');
	await analyzePackage('twitch');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const entries: any[] = [];

	for (const [, sym] of rootSymbols) {
		entries.push(sym.serialize());
	}

	console.log(JSON.stringify({ entries }, null, 2));
}

void main();
