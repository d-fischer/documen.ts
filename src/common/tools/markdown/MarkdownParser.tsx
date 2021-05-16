import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { HashLink } from 'react-router-hash-link';
import { CodeBlock } from '../../components/CodeBlock';
import { customDirectives } from './plugins/customDirectives';
import { symbolLinks } from './plugins/symbolLinks';

interface MarkdownParserProps {
	source: string;
}

const useStyles = makeStyles(theme => ({
	link: {
		color: theme.colors.link,
		fontWeight: 'bold',
		textDecoration: 'none'
	},
	warning: {
		display: 'flow-root',
		borderLeft: `${theme.spacing.unit / 2} solid ${theme.colors.warning}`,
		backgroundColor: theme.colors.background.active,
		marginBottom: '1em',
		padding: '0 1em'
	},
	warningTitle: {
		fontSize: '1em',
	}
}), { name: 'MarkdownParser' });

const MarkdownParser: React.FC<MarkdownParserProps> = ({ source }) => {
	const classes = useStyles();

	const components = useMemo(() => ({
		/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/naming-convention
		a: function MdLink(mdProps: any) {
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
		code: function MdCodeBlock({node, inline, className, children, ...props}: any) {
			if (!inline) {
				const match = /language-(\w+)/.exec(className || '');
				if (match) {
					return <CodeBlock lang={match[1]} langMeta={node.data?.meta} text={String(children).trimEnd()}/>;
				}
			}
			return <code className={className} {...props}>{children}</code>;
		},
		/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */
	}), [classes]);

	const customDirectiveClasses = useMemo(() => ({
		warning: classes.warning,
		warningTitle: classes.warningTitle
	}), [classes]);

	// 	if (node.type === 'paragraph' && !event.entering) {
	// 		if (node.firstChild?.literal === '/' && node.firstChild.next?.literal === '!' && node.firstChild.next.next?.literal === '\\' && node.firstChild.next.next.next) {
	// 			const parent = new Node('custom_block', node.sourcepos);
	// 			warningNodes.add(parent.);
	// 			const textNode = node.firstChild.next.next.next;
	// 			textNode.literal = textNode.literal?.trimStart() ?? null;
	// 			parent.appendChild(textNode);
	// 			node.insertAfter(parent);
	// 			node.firstChild.next.next.unlink();
	// 			node.firstChild.next.unlink();
	// 			node.firstChild.unlink();
	// 			node.unlink();
	// 		}
	// 		// transform linked type names

	return <ReactMarkdown remarkPlugins={[symbolLinks, [customDirectives, { classes: customDirectiveClasses }]]} components={components}>{source}</ReactMarkdown>
};

export default React.memo(MarkdownParser);
