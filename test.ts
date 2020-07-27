import { twoslasher } from '@typescript/twoslash';
import { createDefaultMapFromNodeModules } from '@typescript/vfs';
import ts from 'typescript';
import lzString from 'lz-string';

export function testTransform(): ts.TransformerFactory<ts.SourceFile> {
	return (ctx: ts.TransformationContext) => {
		const scanVisitor: ts.Visitor = node => {
			if (
				ts.isVariableDeclaration(node) &&
				ts.isIdentifier(node.name) &&
				node.initializer &&
				ts.isCallExpression(node.initializer) &&
				ts.isIdentifier(node.initializer.expression) &&
				node.initializer.expression.text === 'require'
			) {
				const importName = node.name.text;
				console.log(`found import "${importName}"`);
			}
			return ts.visitEachChild(node, scanVisitor, ctx);
		};
		return node => ts.visitNode(node, scanVisitor);
	};
}

(async () => {
	const fsMap = await createDefaultMapFromNodeModules({ lib: ['es6'] }, ts);
	console.log(twoslasher(`
import { Foo } from './foo';
const foo = new Foo();

// @filename: foo.ts
export class Foo {}
`, 'ts', {
		defaultOptions: { showEmit: true },
		defaultCompilerOptions: { module: ts.ModuleKind.CommonJS },
		tsModule: ts,
		lzstringModule: lzString,
		fsMap,
		customTransformers: { after: [testTransform()] }
	}));
})();
