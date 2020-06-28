import React from 'react';
import { ReferenceNode } from '../reference';
import { Link } from 'react-router-dom';
import { getPageType } from '../Tools/CodeTools';
import { findSymbolByMember } from '../Tools/ReferenceTools';
import { getPackagePath } from '../Tools/StringTools';
import { makeStyles } from '@material-ui/styles';

interface TypeLinkProps {
	id?: number;
	name: string;
	symbol?: ReferenceNode;
}

const useStyles = makeStyles(theme => ({
	root: {
		color: theme.colors.link,
		fontWeight: 'bold',
		textDecoration: 'none'
	}
}), { name: 'TypeLink' });

const TypeLink: React.FC<TypeLinkProps> = ({ id, name, children, symbol }) => {
	const classes = useStyles();

	let packageName: string | undefined = undefined;

	if (!symbol) {
		const symbolDef = id ? findSymbolByMember('id', id) : findSymbolByMember('name', name);
		if (symbolDef) {
			symbol = symbolDef.symbol;
			packageName = symbolDef.packageName;
		}
	}

	if (!symbol) {
		return <>{children}</>;
	}

	return <Link className={classes.root} to={`${getPackagePath(packageName)}/reference/${getPageType(symbol)}/${name}`}>{children}</Link>;
};

export default TypeLink;
