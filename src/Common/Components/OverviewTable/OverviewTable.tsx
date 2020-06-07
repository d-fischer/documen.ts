import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AccessorReferenceNode, EnumMemberReferenceNode, MethodReferenceNode, PropertyReferenceNode } from '../../reference';
import OverviewTableEntry from './OverviewTableEntry';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		margin: theme.spacing.unit * 2,
		padding: theme.spacing.unit * 2,
		border: `1px solid ${theme.colors.border}`
	},
	column: {
		minWidth: 300
	},
	heading: {
		margin: 0,
		marginBottom: theme.spacing.unit
	},
	list: {
		margin: 0,
		paddingLeft: theme.spacing.unit * 2
	}
}), { name: 'OverviewTable' });

type OverviewTablePropertyEntry = PropertyReferenceNode | AccessorReferenceNode;

interface OverviewTableProps {
	members?: EnumMemberReferenceNode[];
	events?: PropertyReferenceNode[];
	properties?: OverviewTablePropertyEntry[];
	methods?: MethodReferenceNode[];
}

const OverviewTable: React.FC<OverviewTableProps> = ({ members, events, properties, methods }) => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			{members?.length ? (
				<div className={classes.column}>
					<h3 className={classes.heading}>Members</h3>
					<ul className={classes.list}>
						{members.map(member => <OverviewTableEntry key={member.id} node={member}/>)}
					</ul>
				</div>
			) : null}
			{events?.length ? (
				<div className={classes.column}>
					<h3 className={classes.heading}>Events</h3>
					<ul className={classes.list}>
						{events.map(event => <OverviewTableEntry key={event.id} node={event}/>)}
					</ul>
				</div>
			) : null}
			{properties?.length ? (
				<div className={classes.column}>
					<h3 className={classes.heading}>Properties</h3>
					<ul className={classes.list}>
						{properties.map(prop => <OverviewTableEntry key={prop.id} node={prop}/>)}
					</ul>
				</div>
			) : null}
			{methods?.length ? (
				<div className={classes.column}>
					<h3 className={classes.heading}>Methods</h3>
					<ul className={classes.list}>
						{methods.map(method => <OverviewTableEntry key={method.id} node={method}/>)}
					</ul>
				</div>
			) : null}
		</div>
	);
};

export default OverviewTable;
