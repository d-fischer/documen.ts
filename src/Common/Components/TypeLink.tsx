import * as React from 'react';
import { ReferenceNode } from '../reference';
import { Link } from 'react-router-dom';
import { getPageType } from '../Tools/CodeBuilders';
import { findSymbolByMember } from '../Tools/ReferenceTools';
import { getPackagePath } from '../Tools/StringTools';

interface TypeLinkProps {
	id?: number;
	name: string;
	symbol?: ReferenceNode;
	packageName?: string;
}

const TypeLink: React.FC<TypeLinkProps> = ({ id, name, children, symbol, packageName }) => {
	if (!symbol) {
		const symbolDef = id ? findSymbolByMember('id', id, undefined, packageName) : findSymbolByMember('name', name, undefined, packageName);
		if (symbolDef) {
			symbol = symbolDef.symbol;
			packageName = symbolDef.packageName;
		}
	}

	if (!symbol) {
		return <>{children}</>;
	}

	return <Link to={`${getPackagePath(packageName)}/reference/${getPageType(symbol)}/${name}`}>{children}</Link>;
};

export default TypeLink;
