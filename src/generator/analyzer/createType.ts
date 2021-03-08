import assert from 'assert';
import ts from 'typescript';
import { intrinsicTypeReflector } from './types/IntrinsicType';
import { literalTypeReflector } from './types/LiteralType';
import { referenceTypeReflector } from './types/ReferenceType';
import type { Type } from './types/Type';
import { unionTypeReflector } from './types/UnionType';
import { UnknownType } from './types/UnknownType';

export interface TypeReflector<NodeType extends ts.TypeNode = ts.TypeNode, TypeType extends ts.Type = ts.Type> {
	kinds: Array<NodeType['kind']>;

	// eslint-disable-next-line @typescript-eslint/method-signature-style
	fromNode?(checker: ts.TypeChecker, node: NodeType): Type;

	// eslint-disable-next-line @typescript-eslint/method-signature-style
	fromType?(checker: ts.TypeChecker, type: TypeType, node: NodeType): Type;
}

const typeReflectors = new Map<ts.SyntaxKind, TypeReflector>();

function loadTypeReflectors() {
	if (typeReflectors.size) {
		return;
	}

	for (const reflector of [intrinsicTypeReflector, literalTypeReflector, referenceTypeReflector, unionTypeReflector]) {
		for (const kind of reflector.kinds) {
			typeReflectors.set(kind, reflector);
		}
	}
}

function getReflectorForKind(kind: ts.SyntaxKind): Required<Omit<TypeReflector, 'kinds'>> {
	loadTypeReflectors();
	return {
		fromNode(checker, node) {
			return new UnknownType(node.getText(), 'node');
		},
		fromType(checker, type) {
			return new UnknownType(checker.typeToString(type), 'type');
		},
		...typeReflectors.get(kind)
	};
}

export function createTypeFromNode(checker: ts.TypeChecker, node: ts.TypeNode) {
	const reflector = getReflectorForKind(node.kind);

	return reflector.fromNode(checker, node);
}

export function createTypeFromTsType(checker: ts.TypeChecker, type: ts.Type) {
	const typeNode = checker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.IgnoreErrors);
	assert(typeNode);

	const reflector = getReflectorForKind(typeNode.kind);

	return reflector.fromType(checker, type, typeNode);
}
