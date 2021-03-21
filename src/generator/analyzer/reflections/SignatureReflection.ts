import * as ts from 'typescript';
import type { CallSignatureReferenceNode, ConstructSignatureReferenceNode, GetSignatureReferenceNode, SetSignatureReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { resolvePromiseArray } from '../util/promises';
import { ParameterReflection } from './ParameterReflection';
import { Reflection } from './Reflection';
import { TypeParameterReflection } from './TypeParameterReflection';

export class SignatureReflection extends Reflection {
	static async fromTsSignature(
		ctx: AnalyzeContext,
		parent: Reflection | undefined,
		kind: ts.SyntaxKind.CallSignature | ts.SyntaxKind.ConstructSignature | ts.SyntaxKind.GetAccessor | ts.SyntaxKind.SetAccessor,
		signature: ts.Signature,
		declaration?: ts.SignatureDeclaration
	) {
		const params = await resolvePromiseArray(signature.parameters.map(async (param, i) => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			const paramNode = declaration?.parameters?.[i];
			return ParameterReflection.fromSymbol(ctx, param, paramNode);
		}));

		const typeParams = await resolvePromiseArray(signature.typeParameters?.map(async param => {
			const p = new TypeParameterReflection(param);
			await p.processChildren(ctx);
			return p;
		}));

		const returnType = await createTypeFromTsType(ctx, signature.getReturnType());

		return new SignatureReflection(parent, kind, returnType, params, typeParams, signature);
	}

	constructor(
		private readonly _parent: Reflection | undefined,
		private readonly _kind: ts.SyntaxKind.CallSignature | ts.SyntaxKind.ConstructSignature | ts.SyntaxKind.GetAccessor | ts.SyntaxKind.SetAccessor,
		private readonly _returnType: Type,
		private readonly _params: ParameterReflection[] | undefined,
		private readonly _typeParams?: TypeParameterReflection[],
		private readonly _signature?: ts.Signature
	) {
		super();
	}

	get declarations(): ts.Declaration[] {
		const decl = this._signature?.getDeclaration();
		return decl ? [decl] : [];
	}

	get name() {
		if (this._kind === ts.SyntaxKind.ConstructSignature) {
			return 'constructor';
		}

		return this._parent?.name ?? '__type';
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

	serialize(): CallSignatureReferenceNode | GetSignatureReferenceNode | SetSignatureReferenceNode | ConstructSignatureReferenceNode {
		return {
			...this._baseSerialize(),
			kind: this.serializedKind,
			parameters: this._params?.map(param => param.serialize()),
			type: this._returnType.serialize(),
			typeParameters: this._typeParams?.map(tp => tp.serialize())
		};
	}
}
