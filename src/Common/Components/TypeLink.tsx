import * as React from 'react';
import { findByMember } from '../Tools/ArrayTools';
import reference from '../Reference';
import { Link } from 'react-router-dom';
import { getPageType } from '../Tools/CodeBuilders';

interface TypeLinkProps {
	name: string;
}

const TypeLink: React.FC<TypeLinkProps> = ({ name, children }) => {
	const symbol = findByMember(reference.children, 'name', name);

	if (!symbol) {
		return <>{children}</>;
	}

	return <Link to={`/reference/${getPageType(symbol)}/${name}`}>{children}</Link>;
};

export default TypeLink;
