import * as ts from 'typescript';
import type { CallSignatureReferenceNode, ConstructSignatureReferenceNode, GetSignatureReferenceNode, SetSignatureReferenceNode } from '../../../common/reference';
import { createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { ParameterReflection } from './ParameterReflection';
import { Reflection } from './Reflection';

export class SignatureReflection extends Reflection {
	static fromTsSignature(
		checker: ts.TypeChecker,
		parentName: string,
		kind: ts.SyntaxKind.CallSignature | ts.SyntaxKind.ConstructSignature | ts.SyntaxKind.GetAccessor | ts.SyntaxKind.SetAccessor,
		signature: ts.Signature,
		declaration?: ts.SignatureDeclaration
	) {
		const params = signature.parameters.map((param, i) => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			const paramNode = declaration?.parameters?.[i];
			return ParameterReflection.fromSymbol(checker, param, paramNode);
		});

		const returnType = createTypeFromTsType(checker, signature.getReturnType());

		return new SignatureReflection(parentName, kind, params, returnType, signature);
	}

	constructor(
		private readonly _parentName: string,
		private readonly _kind: ts.SyntaxKind.CallSignature | ts.SyntaxKind.ConstructSignature | ts.SyntaxKind.GetAccessor | ts.SyntaxKind.SetAccessor,
		private readonly _params: ParameterReflection[],
		private readonly _returnType: Type,
		private readonly _signature?: ts.Signature
	) {
		super();
	}

	get declarations(): ts.Declaration[] {
		const decl = this._signature?.getDeclaration();
		return decl ? [decl] : [];
	}

	get name() {
		return this._parentName;
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
			parameters: this._params.map(param => param.serialize()),
			type: this._returnType.serialize()
		};
	}
}
