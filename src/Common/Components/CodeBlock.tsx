import { makeStyles } from '@material-ui/styles';
import { twoslasher } from '@typescript/twoslash';
import * as lzString from 'lz-string';
import * as randomstring from 'randomstring';
import React, { useCallback, useMemo, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsHighlight from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import tsHighlight from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import darcula from 'react-syntax-highlighter/dist/esm/styles/hljs/darcula';
import * as ts from 'typescript';

SyntaxHighlighter.registerLanguage('javascript', jsHighlight);
SyntaxHighlighter.registerLanguage('js', jsHighlight);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('typescript', tsHighlight);
SyntaxHighlighter.registerLanguage('ts', tsHighlight);

interface CodeBlockProps {
	codeInfo?: string[];
	text: string;
}

export function friendlyCjsTransform(): ts.TransformerFactory<ts.SourceFile> {
	return (ctx: ts.TransformationContext) => {
		const { factory } = ctx;
		const visitor: ts.Visitor = node => {
			if (
				ts.isImportDeclaration(node) &&
				node.importClause?.namedBindings &&
				ts.isNamedImports(node.importClause.namedBindings)
			) {
				return factory.createVariableStatement(
					undefined,
					factory.createVariableDeclarationList(
						[
							factory.createVariableDeclaration(
								factory.createObjectBindingPattern(node.importClause.namedBindings.elements.map(elem => factory.createBindingElement(
									undefined,
									elem.propertyName,
									elem.name
								))),
								undefined,
								undefined,
								factory.createCallExpression(
									factory.createIdentifier('require'),
									undefined,
									[
										node.moduleSpecifier
									]
								)
							)
						],
						ts.NodeFlags.Const
					)
				);
			}
			return ts.visitEachChild(node, visitor, ctx);
		};
		return node => ts.visitNode(node, visitor);
	};
}

const useStyles = makeStyles(theme => ({
	wrapper: {
		position: 'relative'
	},
	modeSwitcher: {
		position: 'absolute',
		right: theme.spacing.unit,
		top: theme.spacing.unit,
		display: 'flex',
		border: `1px solid ${theme.colors.border}`,
		opacity: 0,
		pointerEvents: 'none',
		transition: 'opacity .5s ease-in-out',
		'$wrapper:hover &': {
			pointerEvents: 'auto',
			opacity: 1
		}
	},
	modeInput: {
		display: 'none'
	},
	mode: {
		padding: theme.spacing.unit,
		borderLeft: `1px solid ${theme.colors.border}`,
		transition: 'background-color .3s ease-in-out',
		cursor: 'pointer',
		'&:first-of-type': {
			borderLeft: '0 none'
		},
		'input:checked + &': {
			background: theme.colors.border,
		}
	}
}));

export const CodeBlock: React.FC<CodeBlockProps> = __DOCTS_COMPONENT_MODE === 'static' ? (
	props => {
		const { codeInfo: [language, languageMode] = [], text } = props;
		if (languageMode === 'twoslash') {
			// clean up a tiny bit of twoslash specific stuff for the static output
			const cleanText = text.replace(/[\w\W]*?(?:^|\n)\/\/ ---cut---\n/, '').replace(/\/\/ @.*\n/g, '');
			return (
				<div data-dynamic-component="CodeBlock" data-component-props={JSON.stringify(props)}>
					<SyntaxHighlighter language={language} style={darcula as unknown}>
						{cleanText}
					</SyntaxHighlighter>
				</div>
			);
		}

		return (
			<SyntaxHighlighter language={language} style={darcula as unknown}>
				{text}
			</SyntaxHighlighter>
		);
	}
) : (
	({ codeInfo: [language, languageMode] = [], text }) => {
		const isTwoslash = languageMode === 'twoslash';
		const classes = useStyles();
		const [idSuffix] = useState(() => randomstring.generate({ length: 8, charset: 'alphabetic' }));
		const [mode, setMode] = useState('ts');
		const transpile = mode !== 'ts';
		const showCjs = mode === 'cjs';
		const changeMode = useCallback<React.EventHandler<React.FormEvent<HTMLInputElement>>>((e) => {
			setMode(e.currentTarget.value);
		}, []);
		const twoslashed = useMemo(() => isTwoslash ? twoslasher(text, 'ts', {
			defaultOptions: { showEmit: transpile },
			tsModule: ts,
			lzstringModule: lzString,
			// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
			fsMap: require('../../ProgressiveEnhancement/fsMap').fsMap,
			customTransformers: showCjs ? { after: [friendlyCjsTransform()] } : undefined
		}) : undefined, [text, transpile, showCjs]);

		if (!isTwoslash) {
			return (
				<SyntaxHighlighter language={language} style={darcula as unknown}>
					{text}
				</SyntaxHighlighter>
			);
		}

		return (
			<div className={classes.wrapper}>
				<form className={classes.modeSwitcher}>
					<input className={classes.modeInput} type="radio" name="mode" id={`mode-ts-${idSuffix}`} value="ts" checked={mode === 'ts'} onClick={changeMode}/>
					<label className={classes.mode} htmlFor={`mode-ts-${idSuffix}`} title="TypeScript">TS</label>
					<input className={classes.modeInput} type="radio" name="mode" id={`mode-esm-${idSuffix}`} value="esm" checked={mode === 'esm'} onClick={changeMode}/>
					<label className={classes.mode} htmlFor={`mode-esm-${idSuffix}`} title="ES Modules">ESM</label>
					<input className={classes.modeInput} type="radio" name="mode" id={`mode-cjs-${idSuffix}`} value="cjs" checked={mode === 'cjs'} onClick={changeMode}/>
					<label className={classes.mode} htmlFor={`mode-cjs-${idSuffix}`} title="CommonJS">CJS</label>
				</form>
				<SyntaxHighlighter language={language} style={darcula as unknown}>
					{twoslashed!.code}
				</SyntaxHighlighter>
			</div>
		);
	}
);
