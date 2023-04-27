import { makeStyles } from '@mui/styles';
import React from 'react';
import type { TypeAliasReferenceNode } from '../reference';
import MarkdownParser from '../tools/markdown/MarkdownParser';
import Type from './codeBuilders/Type';

interface TypeAliasHintProps {
	symbol: TypeAliasReferenceNode;
}

/* eslint-disable @typescript-eslint/naming-convention */
const useStyles = makeStyles(
	theme => ({
		root: {
			position: 'relative',
			display: 'inline-block',
			fontWeight: 'normal',

			'&:hover > $hint': {
				display: 'block'
			}
		},
		alias: {
			borderBottom: '1px dashed',
			cursor: 'help'
		},
		hint: {
			position: 'absolute',
			display: 'none',
			top: '100%',
			left: '50%',
			zIndex: 1,
			transform: 'translateX(-50%)'
		},
		toolTip: {
			position: 'relative',
			marginTop: 5,
			borderRadius: 3,
			padding: theme.spacing.unit,
			background: theme.colors.background.active,
			border: `1px solid ${theme.colors.border}`,
			textAlign: 'left',
			fontFamily: theme.fonts.default,
			width: 'min-content',
			minWidth: 250,

			'&::before, &::after': {
				content: '""',
				display: 'block',
				position: 'absolute',
				bottom: '100%',
				left: '50%',
				borderStyle: 'solid'
			},

			'&::before': {
				marginLeft: -5,
				borderWidth: '0 5px 5px',
				borderColor: `transparent transparent ${theme.colors.border}`
			},

			'&::after': {
				marginLeft: -4,
				borderWidth: '0 4px 4px',
				borderColor: `transparent transparent ${theme.colors.background.active}`
			},
			'& code': {
				whiteSpace: 'pre-wrap',
				wordWrap: 'break-word'
			},

			'& > :first-child': {
				marginTop: 0
			},
			'& > :last-child': {
				marginBottom: 0
			}
		},
		aliasedType: {
			fontFamily: theme.fonts.code
		}
	}),
	{ name: 'TypeAliasHint' }
);
/* eslint-enable @typescript-eslint/naming-convention */

const TypeAliasHint: React.FC<TypeAliasHintProps> = ({ symbol: { comment, name, type } }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<abbr className={classes.alias}>{name}</abbr>
			<div className={classes.hint}>
				<div className={classes.toolTip}>
					{comment?.shortText ? <MarkdownParser source={comment.shortText} /> : null}
					{comment?.text ? <MarkdownParser source={comment.text} /> : null}
					<p>
						Aliased type:{' '}
						<span className={classes.aliasedType}>
							<Type def={type} />
						</span>
					</p>
				</div>
			</div>
		</div>
	);
};

export default TypeAliasHint;
