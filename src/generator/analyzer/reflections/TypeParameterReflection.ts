import type ts from 'typescript';
import type { TypeParameterReferenceNode } from '../../../common/reference';
import type { AnalyzeContext } from '../AnalyzeContext';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import type { Type } from '../types/Type';
import { Reflection } from './Reflection';

export class TypeParameterReflection extends Reflection {
	constraint?: Type;
	default?: Type;

	constructor(private readonly _tsParam: ts.TypeParameter | ts.TypeParameterDeclaration) {
		super();
	}

	get declarations() {
		return [];
	}

	async processChildren(ctx: AnalyzeContext) {
		if ('kind' in this._tsParam) {
			// is node
			await this.processJsDoc(this._tsParam);
			const constraintNode = this._tsParam.constraint;
			if (constraintNode) {
				this.constraint = await createTypeFromNode(ctx, constraintNode);
			}

			const defaultNode = this._tsParam.default;
			if (defaultNode) {
				this.default = await createTypeFromNode(ctx, defaultNode);
			}
		} else {
			// is param
			const tsConstraint = this._tsParam.getConstraint();
			if (tsConstraint) {
				this.constraint = await createTypeFromTsType(ctx, tsConstraint);
			}

			const tsDefault = this._tsParam.getDefault();
			if (tsDefault) {
				this.default = await createTypeFromTsType(ctx, tsDefault);
			}
		}
	}

	get name() {
		return 'kind' in this._tsParam ? this._tsParam.name.text : this._tsParam.symbol.name;
	}

	serialize(): TypeParameterReferenceNode {
		return {
			...this._baseSerialize(),
			kind: 'typeParameter',
			name: this.name,
			constraint: this.constraint?.serialize(),
			default: this.default?.serialize(),
		};
	}
}
