import React from 'react';
import { Redirect, useParams } from 'react-router';
import { AccessorReferenceNode, ConstructorReferenceNode, MethodReferenceNode, PropertyReferenceNode, SignatureReferenceNode } from '../reference';
import { filterByMember, findByMember } from '../Tools/ArrayTools';
import PageContent from '../Containers/PageContent';
import { getPageType, hasTag } from '../Tools/CodeTools';
import PropertyCard from '../Components/PropertyCard';
import parseMarkdown from '../Tools/MarkdownParser';
import MethodCard from '../Components/MethodCard';
import SymbolHeader from '../Components/SymbolHeader';
import EventCard from '../Components/EventCard';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import { findSymbolByMember } from '../Tools/ReferenceTools';
import { getPackagePath } from '../Tools/StringTools';

interface ClassPageRouteParams {
	name: string;
}

const ClassPage: React.FC = () => {
	const { name } = useParams<ClassPageRouteParams>();

	const symbolDef = findSymbolByMember('name', name);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const { symbol, packageName } = symbolDef;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'classes') {
		return <Redirect to={`${getPackagePath(packageName)}/${correctPageType}/${name}`}/>;
	}

	const constructor: ConstructorReferenceNode | undefined = findByMember(symbol.children, 'kind', ReferenceNodeKind.Constructor);
	let constructorSigs: SignatureReferenceNode[] = [];
	if (constructor) {
		constructorSigs = constructor.signatures;
	}

	const methods: MethodReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Method);

	const properties: PropertyReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Property);
	const propertiesWithoutEvents = properties.filter(prop => !hasTag(prop, 'eventListener'));
	const events = properties.filter(prop => hasTag(prop, 'eventListener'));

	const accessors: AccessorReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Accessor);

	return (
		<>
			<SymbolHeader symbol={symbol}/>
			<PageContent>
				{symbol.comment && symbol.comment.text && parseMarkdown(symbol.comment.text)}
				{constructorSigs.length ? (
					<>
						<h2>{constructorSigs.length === 1 ? 'Constructor' : 'Constructors'}</h2>
						{constructorSigs.map(sig => <MethodCard key={sig.id} definition={constructor!} sig={sig} isConstructor={true}/>)}
					</>
				) : null}
				{events.length ? (
					<>
						<h2>Events</h2>
						{events.map(prop => <EventCard key={prop.id} definition={prop}/>)}
					</>
				) : null}
				{methods.length ? (
					<>
						<h2>Methods</h2>
						{methods.map(method => method.signatures && method.signatures.map(sig => <MethodCard key={sig.id} definition={method} sig={sig}/>))}
					</>
				) : null}
				{propertiesWithoutEvents.length || accessors.length ? (
					<>
						<h2>Properties</h2>
						{propertiesWithoutEvents.map(prop => <PropertyCard key={prop.id} definition={prop}/>)}
						{accessors.map(acc => {
							if (!acc.getSignature || !acc.getSignature.length) {
								return null;
							}
							return <PropertyCard key={acc.id} name={acc.name} definition={acc}/>;
						})}
					</>
				) : null}
			</PageContent>
		</>
	);
};

export default ClassPage;
