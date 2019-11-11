import * as React from 'react';
import { ReferenceType } from '../reference';
import { buildType } from '../Tools/CodeBuilders';

import { createStyles, withStyles, WithSheet } from '../Tools/InjectStyle';

interface TypeAliasHintProps {
	name: string;
	type: ReferenceType;
}

const styles = createStyles(theme => ({
	root: {
		position: 'relative',
		display: 'inline-block',
		fontWeight: 'normal',

		'&:hover $hint': {
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
		padding: '.5em',
		background: theme.colors.background.active,
		whiteSpace: 'nowrap',
		border: `1px solid ${theme.colors.border}`,

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
		}
	}
}));

const TypeAliasHint: React.FC<TypeAliasHintProps & WithSheet<typeof styles>> = ({ name, type, classes }) => (
	<div className={classes.root}>
		<abbr className={classes.alias}>{name}</abbr>
		<div className={classes.hint}>
			<div className={classes.toolTip}>
				{buildType(type)}
			</div>
		</div>
	</div>
);

export default withStyles(styles)(TypeAliasHint);
