import React from 'react';
import commonmark from 'commonmark';
import ReactRenderer from 'commonmark-react-renderer';
import { HashLink } from 'react-router-hash-link';

import { CodeBlock } from '../Components/CodeBlock';

import { getPageType } from './CodeTools';
import { findSymbolByMember } from './ReferenceTools';
import { getPackagePath } from './StringTools';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

interface MarkdownParserProps {
	source: string;
}

const useStyles = makeStyles(theme => ({
	link: {
		color: theme.colors.link,
		fontWeight: 'bold',
		textDecoration: 'none'
	}
}), { name: 'MarkdownParser' });

const MarkdownParser: React.FC<MarkdownParserProps> = ({ source }) => {
	const classes = useStyles();

	const parser = new commonmark.Parser();
	const intermediate = parser.parse(source);

	const walker = intermediate.walker();
	let event;
	let node;

	while ((event = walker.next())) {
		node = event.node;

		// transform linked type names
		if (node.type === 'text') {
			const re = /{@((\w+)(?:#(\w+))?)}/g;
			let match;
			while (node.literal && (match = re.exec(node.literal))) {
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

				if (match.index > 0) {
					const beforeText = new commonmark.Node('text');
					beforeText.literal = node.literal.substr(0, match.index);
					node.insertBefore(beforeText);
				}

				const link = new commonmark.Node('link');
				link.destination = `${getPackagePath(packageName)}/reference/${pageType}/${symbolName}`;

				if (memberName) {
					link.destination += `#${memberName}`;
				}

				const linkText = new commonmark.Node('text');
				linkText.literal = fullSymbolName;
				link.appendChild(linkText);
				node.insertBefore(link);

				node.literal = node.literal.substr(match.index + fullMatch.length);
				re.lastIndex = 0;

				if (!node.literal) {
					node.unlink();
					break;
				}
			}
		}
	}

	// noinspection JSUnusedGlobalSymbols
	const renderer = new ReactRenderer(
		{
			renderers: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				link: function MdLink(mdProps: any) {
					const props = {
						key: mdProps.nodeKey,
						className: mdProps.className
					};

					if (mdProps.href.startsWith('/')) {
						return (
							<HashLink {...props} className={classNames(props.className, classes.link)} to={mdProps.href}>
								{mdProps.children}
							</HashLink>
						);
					} else {
						return (
							<a className={classes.link} href={mdProps.href}>
								{mdProps.children}
							</a>
						);
					}
				},

				// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-explicit-any
				code_block: function MdCodeBlock(mdProps: any) {
					return <CodeBlock key={mdProps.nodeKey} codeInfo={mdProps.codeinfo} text={mdProps.literal}/>;
				}
			}
		}
	);
	return <>{renderer.render(intermediate)}</>;
};

export default React.memo(MarkdownParser);
