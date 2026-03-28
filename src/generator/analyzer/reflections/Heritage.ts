import type { ExpressionWithTypeArguments } from 'typescript';
import type { AnalyzeContext } from '../AnalyzeContext.js';
import { createTypeFromNode } from '../createType.js';
import type { Type } from '../types/Type.js';

export class Heritage {
	readonly type: Type;
	readonly node: ExpressionWithTypeArguments;

	static async fromTypeNode(ctx: AnalyzeContext, node: ExpressionWithTypeArguments) {
		return new Heritage(await createTypeFromNode(ctx, node), node);
	}

	constructor(type: Type, node: ExpressionWithTypeArguments) {
		this.type = type;
		this.node = node;
	}
}
