import { makeStyles } from '@mui/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import type { ReferenceNode } from '../reference';
import { getPageType } from '../tools/CodeTools';
import { findSymbolByMember } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';

interface TypeLinkProps {
	id?: number;
	name: string;
	symbol?: ReferenceNode;
}

const useStyles = makeStyles(
	theme => ({
		root: {
			color: theme.colors.link,
			fontWeight: 'bold',
			textDecoration: 'none'
		}
	}),
	{ name: 'TypeLink' }
);

const TypeLink: React.FC<React.PropsWithChildren<TypeLinkProps>> = ({ id, name, children, symbol }) => {
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

	return (
		<Link className={classes.root} to={`/reference${getPackagePath(packageName)}/${getPageType(symbol)}/${name}`}>
			{children}
		</Link>
	);
};

export default TypeLink;
