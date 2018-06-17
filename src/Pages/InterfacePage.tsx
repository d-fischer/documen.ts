import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import CodeLink from '../Components/CodeLink';
import reference, { MethodReferenceNode, PropertyReferenceNode, ReferenceNodeKind } from '../Resources/data/reference';
import { filterByMember, findByMember } from '../Tools/ArrayTools';
import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import { getPageType } from '../Tools/CodeBuilders';
import PropertyCard from '../Components/PropertyCard';
import MethodCard from '../Components/MethodCard';

interface ClassPageRouteProps {
	name: string;
}

const InterfacePage: React.SFC<RouteComponentProps<ClassPageRouteProps>> = ({ match: { params: { name } } }) => {
	const symbol = findByMember(reference.children, 'name', name);

	if (!symbol) {
		// TODO
		return null;
	}

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'interfaces') {
		return <Redirect to={`/${correctPageType}/${name}`}/>;
	}

	const methods: MethodReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Method);

	const properties: PropertyReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Property);

	return (
		<>
			<PageHeader>
				<h1>{symbol.name}</h1>
				<CodeLink symbol={symbol}/>
				{symbol.comment && symbol.comment.shortText && <p>{symbol.comment.shortText}</p>}
			</PageHeader>
			<PageContent>
				{methods.length ? (
					<>
						<h2>Methods</h2>
						{methods.map(method => method.signatures && method.signatures.map(sig => <MethodCard key={sig.id} sig={sig}/>))}
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
