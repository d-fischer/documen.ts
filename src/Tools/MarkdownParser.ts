import * as React from 'react';
import * as commonmark from 'commonmark';
import * as ReactRenderer from 'commonmark-react-renderer';
import { HashLink } from 'react-router-hash-link';

import SyntaxHighlighter from 'react-syntax-highlighter/light';
// tslint:disable-next-line:match-default-export-name
import darcula from 'react-syntax-highlighter/styles/hljs/darcula';

import { getPageType } from './CodeBuilders';
import { findByMember } from './ArrayTools';
import reference from '../Resources/data/reference';

export default function parseMarkdown(source: string) {
	const parser = new commonmark.Parser();
	const intermediate = parser.parse(source);

	const walker = intermediate.walker();
	let event;
	let node;

	// tslint:disable-next-line:no-conditional-assignment
	while (event = walker.next()) {
		node = event.node;

		// transform linked type names
		if (node.type === 'text') {
			const re = /{@((\w+)(?:#(\w+))?)}/g;
			let match;
			// tslint:disable-next-line:no-conditional-assignment
			while (node.literal && (match = re.exec(node.literal))) {
				const [fullMatch, fullSymbolName, symbolName, memberName] = match;

				const entry = findByMember(reference.children, 'name', symbolName);
				if (!entry) {
					continue;
				}
				const pageType = getPageType(entry);
				if (!pageType) {
					continue;
				}

				if (match.index > 0) {
					const beforeText = new commonmark.Node('text');
					beforeText.literal = node.literal.substr(0, match.index);
					node.insertBefore(beforeText);
				}

				const link = new commonmark.Node('link');
				link.destination = `/${pageType}/${symbolName}`;

				if (memberName) {
					link.destination += `#symbol__${memberName}`;
				}

				const linkText = new commonmark.Node('text');
				linkText.literal = fullSymbolName;
				link.appendChild(linkText);
				node.insertBefore(link);

				node.literal = node.literal.substr(match.index + fullMatch.length);

				if (!node.literal) {
					node.unlink();
					break;
				}
			}
		}
	}

	// noinspection JSUnusedGlobalSymbols
	const renderer = new ReactRenderer({
		renderers: {
			// tslint:disable-next-line:no-any
			link: function MdLink(mdProps: any) {
				// tslint:disable-next-line:no-any
				const props: any = {
					key: mdProps.nodeKey,
					className: mdProps.className
				};
				let type: string | React.ComponentClass;

				if (mdProps.href.startsWith('/')) {
					type = HashLink;
					props.to = mdProps.href;
				} else {
					type = 'a';
					props.href = mdProps.href;
				}

				return React.createElement(type, props, mdProps.children);
			},

			// tslint:disable-next-line:no-any
			code_block: function MdCodeBlock(mdProps: any) {
				return React.createElement(SyntaxHighlighter, { key: mdProps.nodeKey, language: mdProps.language, style: darcula }, mdProps.literal);
			}
		}
	});
	return renderer.render(intermediate);
}
