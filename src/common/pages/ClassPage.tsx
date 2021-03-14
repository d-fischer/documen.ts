import React from 'react';
import { Redirect, useParams } from 'react-router';
import EventCard from '../components/cards/EventCard';
import MethodCard from '../components/cards/MethodCard';
import PropertyCard from '../components/cards/PropertyCard';
import OverviewTable from '../components/overviewTable/OverviewTable';
import SymbolHeader from '../components/SymbolHeader';
import PageContent from '../containers/PageContent';
import type { AccessorReferenceNode, ConstructorReferenceNode, MethodReferenceNode, PropertyReferenceNode, CallSignatureReferenceNode } from '../reference';
import { getPageType, hasTag } from '../tools/CodeTools';
import MarkdownParser from '../tools/MarkdownParser';
import { defaultNodeSort, filterChildrenByMember, findChildByMember } from '../tools/NodeTools';
import { findSymbolByMember } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';

interface ClassPageRouteParams {
	name: string;
	pkg?: string;
}

const ClassPage: React.FC = () => {
	const { name, pkg } = useParams<ClassPageRouteParams>();

	const symbolDef = findSymbolByMember('name', name, pkg);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const { symbol, packageName } = symbolDef;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'classes') {
		return <Redirect to={`${getPackagePath(packageName)}/reference/${correctPageType}/${name}`}/>;
	}

	const constructor: ConstructorReferenceNode | undefined = findChildByMember(symbol, 'kind', 'constructor');
	const constructorSigs: CallSignatureReferenceNode[] = constructor?.signatures ?? [];

	const methods: MethodReferenceNode[] = filterChildrenByMember(symbol, 'kind', 'method');

	const properties: PropertyReferenceNode[] = filterChildrenByMember(symbol, 'kind', 'property');
	const propertiesWithoutEvents = properties.filter(prop => !hasTag(prop, 'eventListener'));
	const events = properties.filter(prop => hasTag(prop, 'eventListener'));

	const accessors: AccessorReferenceNode[] = filterChildrenByMember(symbol, 'kind', 'accessor');

	return (
		<>
			<SymbolHeader symbol={symbol}/>
			<PageContent>
				{properties.length || methods.length || accessors.length ? (
					<>
						<h2>Overview</h2>
						<OverviewTable
							properties={[...propertiesWithoutEvents, ...accessors]}
							events={events} methods={methods}
						/>
					</>
				) : null}
				{symbol.comment?.text && <MarkdownParser source={symbol.comment.text}/>}
				{constructorSigs.length ? (
					<>
						<h2>{constructorSigs.length === 1 ? 'Constructor' : 'Constructors'}</h2>
						{constructorSigs.map(sig => <MethodCard key={sig.id} definition={constructor!} sig={sig} isConstructor={true}/>)}
					</>
				) : null}
				{events.length ? (
					<>
						<h2>Events</h2>
						{events.sort(defaultNodeSort).map(prop => <EventCard key={prop.id} definition={prop}/>)}
					</>
				) : null}
				{propertiesWithoutEvents.length || accessors.length ? (
					<>
						<h2>Properties</h2>
						{propertiesWithoutEvents.sort(defaultNodeSort).map(prop => <PropertyCard key={prop.id} definition={prop}/>)}
						{accessors.map(acc => {
							if (!acc.getSignature) {
								return null;
							}
							return <PropertyCard key={acc.id} name={acc.name} definition={acc}/>;
						})}
					</>
				) : null}
				{methods.length ? (
					<>
						<h2>Methods</h2>
						{methods.sort(defaultNodeSort).map(method => method.signatures?.map(sig => <MethodCard key={sig.id} definition={method} sig={sig}/>))}
					</>
				) : null}
			</PageContent>
		</>
	);
};

export default ClassPage;
