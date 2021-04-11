import assert from 'assert';
import ts from 'typescript';
import type { AnalyzeContext } from './AnalyzeContext';
import { arrayTypeReflector } from './types/ArrayType';
import { functionTypeReflector } from './types/FunctionType';
import { IntrinsicType, intrinsicTypeReflector } from './types/IntrinsicType';
import { literalTypeReflector } from './types/LiteralType';
import { objectLiteralTypeReflector } from './types/ObjectLiteralType';
import { optionalTypeReflector } from './types/OptionalType';
import { exprWithTypeArgsReflector, referenceTypeReflector } from './types/ReferenceType';
import { tupleTypeReflector } from './types/TupleType';
import type { Type } from './types/Type';
import { typeOperatorTypeReflector } from './types/TypeOperatorType';
import { unionTypeReflector } from './types/UnionType';
import { UnknownType } from './types/UnknownType';

export interface TypeReflector<NodeType extends ts.TypeNode = ts.TypeNode, TypeType extends ts.Type = ts.Type> {
	kinds: Array<NodeType['kind']>;

	// eslint-disable-next-line @typescript-eslint/method-signature-style
	fromNode?(ctx: AnalyzeContext, node: NodeType): Promise<Type>;

	// eslint-disable-next-line @typescript-eslint/method-signature-style
	fromType?(ctx: AnalyzeContext, type: TypeType, node: NodeType): Promise<Type>;
}

const typeReflectors = new Map<ts.SyntaxKind, TypeReflector>();

function loadTypeReflectors() {
	if (typeReflectors.size) {
		return;
	}

	for (const reflector of [
		arrayTypeReflector,
		exprWithTypeArgsReflector,
		functionTypeReflector,
		intrinsicTypeReflector,
		literalTypeReflector,
		objectLiteralTypeReflector,
		optionalTypeReflector,
		referenceTypeReflector,
		tupleTypeReflector,
		typeOperatorTypeReflector,
		unionTypeReflector
	]) {
		for (const kind of reflector.kinds) {
			typeReflectors.set(kind, reflector);
		}
	}
}

function getReflectorForKind(kind: ts.SyntaxKind): Required<Omit<TypeReflector, 'kinds'>> {
	loadTypeReflectors();
	return {
		async fromNode(ctx, node) {
			return new UnknownType(node.getText(), ts.SyntaxKind[node.kind], 'node');
		},
		async fromType(ctx, type, node) {
			return new UnknownType(ctx.checker.typeToString(type), ts.SyntaxKind[node.kind], 'type');
		},
		...typeReflectors.get(kind)
	};
}

export async function createTypeFromNode(ctx: AnalyzeContext, node?: ts.TypeNode) {
	if (!node) {
		return new IntrinsicType('any');
	}

	const reflector = getReflectorForKind(node.kind);

	return reflector.fromNode(ctx, node);
}

export async function createTypeFromTsType(ctx: AnalyzeContext, type?: ts.Type) {
	if (!type) {
		return new IntrinsicType('any');
	}

	const typeNode = ctx.checker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.IgnoreErrors);
	assert(typeNode);

	const reflector = getReflectorForKind(typeNode.kind);

	return reflector.fromType(ctx, type, typeNode);
}
