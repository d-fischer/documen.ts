import * as ts from 'typescript';
import type { CallSignatureReferenceNode, ConstructSignatureReferenceNode, GetSignatureReferenceNode, SetSignatureReferenceNode } from '../../../common/reference';
import { createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { ParameterReflection } from './ParameterReflection';
import { Reflection } from './Reflection';

export class SignatureReflection extends Reflection {
	params!: ParameterReflection[];
	returnType!: Type;

	constructor(
		private readonly _parentName: string,
		private readonly _kind: ts.SyntaxKind.CallSignature | ts.SyntaxKind.ConstructSignature | ts.SyntaxKind.GetAccessor | ts.SyntaxKind.SetAccessor,
		private readonly _signature: ts.Signature,
		private readonly _declaration?: ts.SignatureDeclaration
	) {
		super();
	}

	get declarations(): ts.Declaration[] {
		const decl = this._signature.getDeclaration();
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return decl ? [decl] : [];
	}

	async processChildren(checker: ts.TypeChecker) {
		this.params = await Promise.all(
			this._signature.parameters.map(async (param, i) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				const paramNode = this._declaration?.parameters?.[i];
				const declSym = new ParameterReflection(param, paramNode);
				await declSym.processChildren(checker);
				return declSym;
			})
		);

		this.returnType = createTypeFromTsType(checker, this._signature.getReturnType());
	}

	get name() {
		return this._parentName;
	}

	get serializedKind() {
		switch (this._kind) {
			case ts.SyntaxKind.CallSignature: return 'callSignature';
			case ts.SyntaxKind.GetAccessor: return 'getSignature';
			case ts.SyntaxKind.SetAccessor: return 'setSignature';
			case ts.SyntaxKind.ConstructSignature: return 'constructSignature';
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			default: throw new Error(`unknown signature kind: ${this._kind} (${ts.SyntaxKind[this._kind]})`);
		}
	}

	serialize(): CallSignatureReferenceNode | GetSignatureReferenceNode | SetSignatureReferenceNode | ConstructSignatureReferenceNode {
		return {
			...this._baseSerialize(),
			kind: this.serializedKind,
			parameters: this.params.map(param => param.serialize()),
			type: this.returnType.serialize()
		};
	}
}
