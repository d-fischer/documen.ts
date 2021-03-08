import type * as ts from 'typescript';
import type { SignatureReferenceNode } from '../../../common/reference';
import { createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { DeclarationBasedReflection } from './DeclarationBasedReflection';
import { ParameterReflection } from './ParameterReflection';
import type { SymbolBasedReflection } from './SymbolBasedReflection';

export class CallSignatureReflection extends DeclarationBasedReflection<ts.SignatureDeclaration> {
	params!: ParameterReflection[];
	returnType!: Type;

	constructor(private readonly _parent: SymbolBasedReflection, declaration: ts.SignatureDeclaration, private readonly _signature: ts.Signature) {
		super(declaration);
	}

	async processChildren(checker: ts.TypeChecker) {
		this.params = await Promise.all(this._signature.parameters.map(async (param, i) => {
			const paramNode = this._declaration.parameters[i];
			const declSym = new ParameterReflection(param, paramNode);
			await declSym.processChildren(checker);
			return declSym;
		}));

		this.returnType = createTypeFromTsType(checker, this._signature.getReturnType());
	}

	get name() {
		return this._parent.name;
	}

	serialize(): SignatureReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'callSignature',
			parameters: this.params.map(param => param.serialize()),
			type: this.returnType.serialize()
		};
	}
}
