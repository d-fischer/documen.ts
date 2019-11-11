import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { MethodReferenceNode, PropertyReferenceNode } from '../reference';
import { filterByMember } from '../Tools/ArrayTools';
import PageContent from '../Containers/PageContent';
import { getPageType } from '../Tools/CodeBuilders';
import PropertyCard from '../Components/PropertyCard';
import MethodCard from '../Components/MethodCard';
import SymbolHeader from '../Components/SymbolHeader';
import parseMarkdown from '../Tools/MarkdownParser';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import { findSymbolByMember } from '../Tools/ReferenceTools';
import { getPackagePath } from '../Tools/StringTools';

interface ClassPageRouteProps {
	name: string;
}

const InterfacePage: React.FC<RouteComponentProps<ClassPageRouteProps>> = ({ match: { params: { name } } }) => {
	const symbolDef = findSymbolByMember('name', name);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const { symbol, packageName } = symbolDef;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'interfaces') {
		return <Redirect to={`${getPackagePath(packageName)}/${correctPageType}/${name}`}/>;
	}

	const methods: MethodReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Method);

	const properties: PropertyReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Property);

	return (
		<>
			<SymbolHeader symbol={symbol}/>
			<PageContent>
				{symbol.comment && symbol.comment.text && parseMarkdown(symbol.comment.text)}
				{methods.length ? (
					<>
						<h2>Methods</h2>
						{methods.map(method => method.signatures && method.signatures.map(sig => <MethodCard key={sig.id} definition={method} sig={sig}/>))}
					</>
				) : null}
				{properties.length ? (
					<>
						<h2>Properties</h2>
						{properties.map(prop => <PropertyCard key={prop.id} definition={prop}/>)}
					</>
				) : null}
			</PageContent>
		</>
	);
};

export default InterfacePage;
