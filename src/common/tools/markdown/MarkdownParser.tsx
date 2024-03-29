import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { HashLink } from 'react-router-hash-link';
import { CodeBlock } from '../../components/CodeBlock';
import { customDirectives } from './plugins/customDirectives';
import { gfmTables } from './plugins/gfmTables';
import { symbolLinks } from './plugins/symbolLinks';

interface MarkdownParserProps {
	source: string;
}

const useStyles = makeStyles(
	theme => ({
		root: {
			'& table': {
				borderCollapse: 'collapse'
			},

			'& th, & td': {
				border: `1px solid ${theme.colors.border}`,
				padding: theme.spacing.unit
			},

			'& li': {
				margin: `${theme.spacing.unit * 2}px 0`,

				'&::marker': {
					color: '#647d0f'
				}
			},

			'& code': {
				outline: `1px solid ${theme.colors.border}`,
				padding: `0 ${theme.spacing.unit / 4}px`,
				borderRadius: 3,
				color: theme.colors.accent.focus,
				backgroundColor: theme.colors.background.active
			},

			// cancel out the above for code blocks
			'& pre > code': {
				outline: '0 none',
				padding: 0,
				borderRadius: 0,
				color: 'inherit',
				backgroundColor: 'inherit'
			}
		},
		link: {
			color: 'inherit',
			fontWeight: 'bold',
			textDecoration: 'none',
			borderBottom: `1.5px solid ${theme.colors.accent.default}`,
			transition: 'border-color .3s ease-in-out',

			'&:hover': {
				borderBottomColor: theme.colors.accent.focus
			}
		},
		warning: {
			display: 'flow-root',
			borderLeft: `${theme.spacing.unit / 2}px solid ${theme.colors.warning}`,
			backgroundColor: theme.colors.background.active,
			marginBottom: '1em',
			padding: '0 1em'
		},
		warningTitle: {
			fontSize: '1em'
		}
	}),
	{ name: 'MarkdownParser' }
);

const MarkdownParser: React.FC<MarkdownParserProps> = ({ source }) => {
	const classes = useStyles();

	const components = useMemo(
		() => ({
			/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */
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
				}
				return (
					<a className={classes.link} href={mdProps.href}>
						{mdProps.children}
					</a>
				);
			},

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			code: function MdCodeBlock({ node, inline, className, children, ...props }: any) {
				if (!inline) {
					const match = /language-(\w+)/.exec(className || '');
					if (match) {
						return (
							<CodeBlock
								lang={match[1]}
								langMeta={node.data?.meta.split(' ') ?? []}
								text={String(children).trimEnd()}
							/>
						);
					}
				}
				return (
					<code className={className} {...props}>
						{children}
					</code>
				);
			}
			/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */
		}),
		[classes]
	);

	const customDirectiveClasses = useMemo(
		() => ({
			warning: classes.warning,
			warningTitle: classes.warningTitle
		}),
		[classes]
	);

	return (
		<ReactMarkdown
			className={classes.root}
			remarkPlugins={[symbolLinks, gfmTables, [customDirectives, { classes: customDirectiveClasses }]]}
			components={components}
		>
			{source}
		</ReactMarkdown>
	);
};

export default React.memo(MarkdownParser);
