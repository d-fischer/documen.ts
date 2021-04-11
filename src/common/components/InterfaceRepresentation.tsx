import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import React from 'react';
import { HashLink } from 'react-router-hash-link';
import type { InterfaceReferenceNode } from '../reference';
import { defaultNodeSort } from '../tools/NodeTools';
import { getChildren } from '../tools/ReferenceTools';
import Type from './codeBuilders/Type';

interface InterfaceRepresentationProps {
	symbol: InterfaceReferenceNode;
	className?: string;
}

const useStyles = makeStyles(theme => ({
	root: {
		fontFamily: theme.fonts.code,
	},
	prop: {
		display: 'block',
		marginLeft: '2em',
		'& + $prop': {
			marginTop: '.5em'
		}
	},
	comment: {
		color: '#808080',
		fontSize: '.8em',

		'&:before': {
			content: '"// "',
			display: 'inline'
		}
	},
	name: {
		color: '#9876AA',
		textDecoration: 'none'
	}
}), { name: 'InterfaceRepresentation' });

const InterfaceRepresentation: React.FC<InterfaceRepresentationProps> = ({ symbol, className }) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.root, className)}>
			{'{'}
			{getChildren(symbol).sort(defaultNodeSort).map(member => {
				if (member.kind === 'property') {
					return (
						<div key={member.name} className={classes.prop}>
							{member.comment?.shortText ? (
								<div className={classes.comment}>
									{member.comment.shortText}
								</div>
							) : null}
							<div>
								<HashLink to={`#${member.name}`} className={classes.name}>{member.name}</HashLink>
								{member.flags?.isOptional ? '?' : ''}
								: <Type def={member.type} ignoreUndefined/>
							</div>
						</div>
					);
				}
				if (member.kind === 'method') {
					const sig = member.signatures![0];
					return (
						<div key={member.name} className={classes.prop}>
							{sig.comment?.shortText ? (
								<div className={classes.comment}>
									{sig.comment.shortText}
								</div>
							) : null}
							<div>
								<HashLink to={`#${member.name}`} className={classes.name}>{member.name}</HashLink>
								{member.flags?.isOptional ? '?' : ''}
								(): <Type def={member.signatures![0].type}/>
							</div>
						</div>
					);
				}
				return null;
			})}
			{'}'}
		</div>
	);
};

export default InterfaceRepresentation;
