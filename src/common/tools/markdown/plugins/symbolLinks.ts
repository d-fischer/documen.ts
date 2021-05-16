import type { Content, Link, Text } from 'mdast';
import type { Transformer } from 'unified';
import type { Parent } from 'unist';
import { visit } from 'unist-util-visit';
import { getPageType } from '../../CodeTools';
import { findSymbolByMember } from '../../ReferenceTools';
import { getPackagePath } from '../../StringTools';

function insertAt(
	array: Parent['children'],
	index: number,
	...items: Content[]
): Parent['children'] {
	return [...array.slice(0, index), ...items, ...array.slice(index)];
}

export function symbolLinks(): Transformer {
	return function transformer(tree) {
		function visitor(node: Text, index: number | null, parent: Parent | null) {
			const symbolLinkRegex = /{@((\w+)(?:#(\w+))?)}/g;
			let match = null;
			while (node.value && (match = symbolLinkRegex.exec(node.value))) {
				const [fullMatch, fullSymbolName, symbolName, memberName] = match;

				const symbolDef = findSymbolByMember('name', symbolName);
				if (!symbolDef) {
					continue;
				}
				const { symbol: entry, packageName } = symbolDef;
				const pageType = getPageType(entry);
				if (!pageType) {
					continue;
				}

				let pretextNode: Text | null  = null;
				if (match.index > 0) {
					pretextNode = {
						type: 'text',
						value: node.value.substr(0, match.index)
					};
				}

				const linkAst: Link = {
					type: 'link',
					url: `/reference${getPackagePath(packageName)}/${pageType}/${symbolName}`,
					children: [
						{
							type: 'text',
							value: fullSymbolName
						}
					]
				};

				if (memberName) {
					linkAst.url += `#${memberName}`;
				}

				const toInsert = [pretextNode, linkAst].filter((v): v is Text | Link => !!v);
				parent!.children = insertAt(parent!.children, index!, ...toInsert);
				index! += toInsert.length;

				node.value = node.value.substr(match.index + fullMatch.length);
				symbolLinkRegex.lastIndex = 0;

				if (!node.value) {
					parent!.children = parent!.children.slice(0, index!);
					break;
				}
			}
		}

		visit(tree, 'text', visitor);
	};
}
