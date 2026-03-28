import { makeStyles } from '@mui/styles';
import React from 'react';
import { Link } from 'react-router';
import type { ReferenceNode } from '../reference/index.js';
import { getPageType } from '../tools/CodeTools.js';
import { findSymbolByMember } from '../tools/ReferenceTools.js';
import { getPackagePath } from '../tools/StringTools.js';

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
			({ symbol, packageName } = symbolDef);
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
