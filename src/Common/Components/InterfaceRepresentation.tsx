import { ReferenceNode } from '../reference';
import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Type from './CodeBuilders/Type';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import classNames from 'classnames';

interface InterfaceRepresentationProps {
	symbol: ReferenceNode;
	className?: string;
}

const useStyles = makeStyles(theme => ({
	root: {
		fontFamily: theme.fonts.code,
	},
	prop: {
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
		color: '#9876AA'
	}
}), { name: 'InterfaceRepresentation' });

const InterfaceRepresentation: React.FC<InterfaceRepresentationProps> = ({ symbol, className }) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.root, className)}>
			{'{'}
			{symbol.children.map(member => {
				if (member.kind === ReferenceNodeKind.Property) {
					return (
						<div className={classes.prop}>
							{member.comment?.shortText ? (
								<div className={classes.comment}>
									{member.comment?.shortText}
								</div>
							) : null}
							<div>
								<span className={classes.name}>{member.name}</span>
								{member.flags.isOptional ? '?' : ''}
								: <Type def={member.type} ignoreUndefined/>
							</div>
						</div>
					);
				}
				if (member.kind === ReferenceNodeKind.Method) {
					return (
						<div className={classes.prop}>
							{member.comment?.shortText ? (
								<div className={classes.comment}>
									{member.comment?.shortText}
								</div>
							) : null}
							<div>
								<span className={classes.name}>{member.name}</span>
								{member.flags.isOptional ? '?' : ''}
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
