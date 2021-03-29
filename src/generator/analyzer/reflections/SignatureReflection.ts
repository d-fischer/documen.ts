import * as ts from 'typescript';
import type {
	CallSignatureReferenceNode,
	ConstructSignatureReferenceNode,
	GetSignatureReferenceNode,
	SetSignatureReferenceNode
} from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { resolvePromiseArray } from '../util/promises';
import { ParameterReflection } from './ParameterReflection';
import { Reflection } from './Reflection';
import { TypeParameterReflection } from './TypeParameterReflection';

type SignatureReflectionKind =
	| ts.SyntaxKind.CallSignature
	| ts.SyntaxKind.ConstructSignature
	| ts.SyntaxKind.GetAccessor
	| ts.SyntaxKind.SetAccessor;

export class SignatureReflection extends Reflection {
	private _returnType!: Type;
	private _params!: ParameterReflection[];
	private _typeParams?: TypeParameterReflection[];

	static async fromTsSignature(
		ctx: AnalyzeContext,
		kind: SignatureReflectionKind,
		signature: ts.Signature,
		parent?: Reflection,
		declaration?: ts.SignatureDeclaration
	) {
		const that = new SignatureReflection(ctx, kind, signature, parent);

		that._params = await resolvePromiseArray(
			signature.parameters.map(async (param, i) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				const paramNode = declaration?.parameters?.[i];
				return ParameterReflection.fromSymbol(ctx, param, paramNode);
			})
		);

		that._typeParams = await resolvePromiseArray(
			signature.typeParameters?.map(async param => TypeParameterReflection.fromTsTypeParameter(ctx, param))
		);

		that._returnType = await createTypeFromTsType(ctx, signature.getReturnType());

		that._handleFlags();
		that._processJsDoc(signature.declaration);

		return that;
	}

	static async fromParts(
		ctx: AnalyzeContext,
		kind: SignatureReflectionKind,
		params: ParameterReflection[],
		returnType: Type,
		parent?: Reflection
	) {
		const that = new SignatureReflection(ctx, kind, undefined, parent);

		that._params = params;
		that._returnType = returnType;

		that._handleFlags();
		that._processJsDoc();

		return that;
	}

	constructor(
		ctx: AnalyzeContext,
		private readonly _kind: SignatureReflectionKind,
		private readonly _signature?: ts.Signature,
		parent?: Reflection
	) {
		super(ctx);
		this.parent = parent;
	}

	get declarations(): ts.Declaration[] {
		const decl = this._signature?.getDeclaration();
		return decl ? [decl] : [];
	}

	get name() {
		if (this._kind === ts.SyntaxKind.ConstructSignature) {
			return 'constructor';
		}

		return this.parent?.name ?? '__type';
	}

	get kind() {
		return this._kind;
	}

	get serializedKind() {
		switch (this._kind) {
			case ts.SyntaxKind.CallSignature:
				return 'callSignature';
			case ts.SyntaxKind.GetAccessor:
				return 'getSignature';
			case ts.SyntaxKind.SetAccessor:
				return 'setSignature';
			case ts.SyntaxKind.ConstructSignature:
				return 'constructSignature';
			default:
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				throw new Error(`unknown signature kind: ${this._kind} (${ts.SyntaxKind[this._kind]})`);
		}
	}

	serialize():
		| CallSignatureReferenceNode
		| GetSignatureReferenceNode
		| SetSignatureReferenceNode
		| ConstructSignatureReferenceNode {
		return {
			...this._baseSerialize(),
			kind: this.serializedKind,
			parameters: this._params.map(param => param.serialize()),
			type: this._returnType.serialize(),
			typeParameters: this._typeParams?.map(tp => tp.serialize())
		};
	}
}
