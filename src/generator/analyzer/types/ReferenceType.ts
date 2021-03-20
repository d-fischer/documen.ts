import assert from 'assert';
import ts from 'typescript';
import type { ReferenceReferenceType } from '../../../common/reference';
import type { TypeReflector } from '../createType';
import { createTypeFromNode, createTypeFromTsType } from '../createType';
import { SymbolBasedReflection } from '../reflections/SymbolBasedReflection';
import { resolvePromiseArray } from '../util/promises';
import { resolveAliasesForSymbol } from '../util/symbolUtil';
import { ArrayType } from './ArrayType';
import { Type } from './Type';

export class ReferenceType extends Type {
	private static readonly _brokenReferences = new Map<ts.Symbol, ReferenceType[]>();

	static registerBrokenReference(symbol: ts.Symbol, type: ReferenceType) {
		if (this._brokenReferences.has(symbol)) {
			this._brokenReferences.get(symbol)!.push(type);
		} else {
			this._brokenReferences.set(symbol, [type]);
		}
	}

	static fixBrokenReferences() {
		for (const [symbol, types] of this._brokenReferences) {
			const reflectionIdForSymbol = SymbolBasedReflection.getReflectionIdForSymbol(symbol);
			if (reflectionIdForSymbol !== undefined) {
				for (const type of types) {
					type._id = reflectionIdForSymbol;
				}
			}
		}
	}

	constructor(private readonly _name: string, private readonly _typeArguments?: Type[], private _id?: number, private readonly _isTypeParameter?: true) {
		super();
	}

	serialize(): ReferenceReferenceType {
		return {
			type: 'reference',
			name: this._name,
			id: this._id,
			typeArguments: this._typeArguments?.map(arg => arg.serialize()),
			isTypeParameter: this._isTypeParameter
		};
	}
}

export const referenceTypeReflector: TypeReflector<ts.TypeReferenceNode, ts.TypeReference> = {
	kinds: [ts.SyntaxKind.TypeReference],

	async fromNode(checker, node) {
		const isArray = checker.typeToTypeNode(checker.getTypeAtLocation(node.typeName), void 0, ts.NodeBuilderFlags.IgnoreErrors)?.kind === ts.SyntaxKind.ArrayType;

		if (isArray) {
			return new ArrayType(await createTypeFromNode(checker, node.typeArguments?.[0]));
		}

		const name = node.typeName.getText();

		const symbol = checker.getSymbolAtLocation(node.typeName)!;
		const origSymbol = resolveAliasesForSymbol(checker, symbol);

		const reflectionIdForSymbol = SymbolBasedReflection.getReflectionIdForSymbol(origSymbol);
		// eslint-disable-next-line no-bitwise
		const result = new ReferenceType(name, await resolvePromiseArray(node.typeArguments?.map(async typeNode => createTypeFromNode(checker, typeNode))), reflectionIdForSymbol, origSymbol.flags & ts.SymbolFlags.TypeParameter ? true : undefined);

		if (reflectionIdForSymbol === undefined) {
			ReferenceType.registerBrokenReference(origSymbol, result);
		}

		return result;
	},
	async fromType(checker, type) {
		const symbol = type.aliasSymbol ?? type.getSymbol();
		assert(symbol);
		const origSymbol = resolveAliasesForSymbol(checker, symbol);
		const reflectionIdForSymbol = SymbolBasedReflection.getReflectionIdForSymbol(origSymbol);
		const result = new ReferenceType(symbol.name, await resolvePromiseArray(type.typeArguments?.map(async arg => createTypeFromTsType(checker, arg))), reflectionIdForSymbol);

		if (reflectionIdForSymbol === undefined) {
			ReferenceType.registerBrokenReference(origSymbol, result);
		}

		return result;
	}
};
