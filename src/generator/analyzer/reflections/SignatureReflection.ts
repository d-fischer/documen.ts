import * as ts from 'typescript';
import type { GetSignatureReferenceNode, SetSignatureReferenceNode, SignatureReferenceNode } from '../../../common/reference';
import { createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { DeclarationBasedReflection } from './DeclarationBasedReflection';
import { ParameterReflection } from './ParameterReflection';
import type { SymbolBasedReflection } from './SymbolBasedReflection';

export class SignatureReflection extends DeclarationBasedReflection<ts.SignatureDeclaration> {
	params!: ParameterReflection[];
	returnType!: Type;

	constructor(
		private readonly _parent: SymbolBasedReflection,
		private readonly _kind: ts.SyntaxKind.CallSignature | ts.SyntaxKind.GetAccessor | ts.SyntaxKind.SetAccessor,
		declaration: ts.SignatureDeclaration,
		private readonly _signature: ts.Signature
	) {
		super(declaration);
	}

	async processChildren(checker: ts.TypeChecker) {
		this.params = await Promise.all(
			this._signature.parameters.map(async (param, i) => {
				const paramNode = this._declaration.parameters[i];
				const declSym = new ParameterReflection(param, paramNode);
				await declSym.processChildren(checker);
				return declSym;
			})
		);

		this.returnType = createTypeFromTsType(checker, this._signature.getReturnType());
	}

	get name() {
		return this._parent.name;
	}

	get serializedKind() {
		switch (this._kind) {
			case ts.SyntaxKind.CallSignature: return 'callSignature';
			case ts.SyntaxKind.GetAccessor: return 'getSignature';
			case ts.SyntaxKind.SetAccessor: return 'setSignature';
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			default: throw new Error(`unknown signature kind: ${this._kind} (${ts.SyntaxKind[this._kind]})`);
		}
	}

	serialize(): SignatureReferenceNode | GetSignatureReferenceNode | SetSignatureReferenceNode {
		return {
			...this._baseSerialize(),
			kind: this.serializedKind,
			parameters: this.params.map(param => param.serialize()),
			type: this.returnType.serialize()
		};
	}
}
