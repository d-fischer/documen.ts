import { makeStyles } from '@material-ui/styles';
import { twoslasher } from '@typescript/twoslash';
import * as lzString from 'lz-string';
import React, { useCallback, useMemo, useState } from 'react';
import { Light as SyntaxHighlighter } from '@d-fischer/react-syntax-highlighter';
import jsHighlight from '@d-fischer/react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import json from '@d-fischer/react-syntax-highlighter/dist/esm/languages/hljs/json';
import tsHighlight from '@d-fischer/react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import darcula from '@d-fischer/react-syntax-highlighter/dist/esm/styles/hljs/darcula';
import * as ts from 'typescript';
import { getRandomString } from '../tools/StringTools';

SyntaxHighlighter.registerLanguage('javascript', jsHighlight);
SyntaxHighlighter.registerLanguage('js', jsHighlight);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('typescript', tsHighlight);
SyntaxHighlighter.registerLanguage('ts', tsHighlight);

interface CodeBlockProps {
	lang?: string;
	langMeta: string[];
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
	},
	diffAddedLine: {
		display: 'block',
		backgroundColor: 'rgba(9, 180, 50, 0.25)'
	},
	diffRemovedLine: {
		display: 'block',
		backgroundColor: 'rgba(255, 106, 105, 0.25)'
	}
}));

// clean up a tiny bit of twoslash specific stuff for the static output
function getCleanText(text: string) {
	return text.replace(/[\w\W]*?(?:^|\n)\/\/ ---cut---\n/, '').replace(/\/\/ @.*\n/g, '');
}

function range(start: number, end: number) {
	return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

function parseRanges(str: string | undefined) {
	return str?.split(',').flatMap(val => {
		const [start, end] = val.split('-');
		if (end) {
			return range(Number(start), Number(end));
		}

		return [Number(start)];
	});
}

export const CodeBlock: React.FC<CodeBlockProps> = __DOCTS_COMPONENT_MODE === 'static' ? (
	props => {
		const { lang, langMeta, text } = props;
		const classes = useStyles();
		const [langMetaName, ...langMetaAdditional] = langMeta;
		if (langMetaName === 'twoslash') {
			const cleanText = getCleanText(text);
			return (
				<div data-dynamic-component="CodeBlock" data-component-props={JSON.stringify(props)}>
					<SyntaxHighlighter wrapLongLines language={lang} style={darcula as unknown}>
						{cleanText}
					</SyntaxHighlighter>
				</div>
			);
		}

		if (langMetaName === 'diff') {
			const expandedAdded = parseRanges(langMetaAdditional.find(tk => tk.startsWith('+'))?.slice(1));
			const expandedRemoved = parseRanges(langMetaAdditional.find(tk => tk.startsWith('-'))?.slice(1));
			return (
				<SyntaxHighlighter
					wrapLongLines
					language={lang}
					style={darcula as unknown}
					wrapLines
					lineProps={lineNumber => {
						let className: string | undefined = undefined;
						if (expandedAdded?.includes(lineNumber)) {
							className = classes.diffAddedLine;
						} else if (expandedRemoved?.includes(lineNumber)) {
							className = classes.diffRemovedLine;
						}

						return { className };
					}}>
					{text}
				</SyntaxHighlighter>
			);
		}

		return (
			<SyntaxHighlighter wrapLongLines language={lang} style={darcula as unknown}>
				{text}
			</SyntaxHighlighter>
		);
	}
) : (
	({ lang, langMeta, text }) => {
		const [langMetaName, ...langMetaAdditional] = langMeta;
		const isTwoslash = langMetaName === 'twoslash';
		const classes = useStyles();
		const [idSuffix] = useState(() => getRandomString(8));
		const [mode, setMode] = useState('ts');
		const transpile = mode !== 'ts';
		const showCjs = mode === 'cjs';
		const changeMode = useCallback<React.EventHandler<React.FormEvent<HTMLInputElement>>>((e) => {
			setMode(e.currentTarget.value);
		}, []);
		const twoslashed = useMemo(() => {
			if (isTwoslash) {
				try {
					return twoslasher(text, 'ts', {
						defaultOptions: { showEmit: transpile },
						tsModule: ts,
						lzstringModule: lzString,
						// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
						fsMap: require('../../progressiveEnhancement/fsMap').fsMap,
						customTransformers: showCjs ? { after: [friendlyCjsTransform()] } : undefined
					});
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error('Error rendering twoslash', e);
					return {
						code: getCleanText(text),
						error: e as Error
					};
				}
			} else {
				return undefined;
			}
		}, [text, transpile, showCjs]);

		if (isTwoslash) {
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
					<SyntaxHighlighter wrapLongLines language={lang} style={darcula as unknown}>
						{twoslashed!.code}
					</SyntaxHighlighter>
				</div>
			);
		}

		if (langMetaName === 'diff') {
			const expandedAdded = parseRanges(langMetaAdditional.find(tk => tk.startsWith('+'))?.slice(1));
			const expandedRemoved = parseRanges(langMetaAdditional.find(tk => tk.startsWith('-'))?.slice(1));
			return (
				<SyntaxHighlighter
					wrapLongLines
					language={lang}
					style={darcula as unknown}
					wrapLines
					lineProps={lineNumber => {
						let className: string | undefined = undefined;
						if (expandedAdded?.includes(lineNumber)) {
							className = classes.diffAddedLine;
						} else if (expandedRemoved?.includes(lineNumber)) {
							className = classes.diffRemovedLine;
						}

						return { className };
					}}>
					{text}
				</SyntaxHighlighter>
			);
		}

		return (
			<SyntaxHighlighter wrapLongLines language={lang} style={darcula as unknown}>
				{text}
			</SyntaxHighlighter>
		);
	}
);
