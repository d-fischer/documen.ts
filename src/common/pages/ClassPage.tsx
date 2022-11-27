import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import BetaNotice from '../components/BetaNotice';
import EventCard from '../components/cards/EventCard';
import MethodCard from '../components/cards/MethodCard';
import PropertyCard from '../components/cards/PropertyCard';
import DeprecationNotice from '../components/DeprecationNotice';
import OverviewTable from '../components/overviewTable/OverviewTable';
import SymbolHeader from '../components/SymbolHeader';
import PageContent from '../containers/PageContent';
import type { PackageContainerRouteParams } from '../containers/ReferencePackageContainer';
import type {
	AccessorReferenceNode,
	CallSignatureReferenceNode,
	ClassReferenceNode,
	ConstructorReferenceNode,
	MethodReferenceNode,
	PropertyReferenceNode
} from '../reference';
import { partition } from '../tools/ArrayTools';
import { getPageType, getTag, hasTag } from '../tools/CodeTools';
import MarkdownParser from '../tools/markdown/MarkdownParser';
import { checkVisibility, defaultNodeSort } from '../tools/NodeTools';
import { filterChildrenByMember, findSymbolByMember } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';

interface ClassPageRouteParams extends PackageContainerRouteParams {
	name: string;
}

const ClassPage: React.FC = () => {
	const { name, packageName } = useParams() as unknown as ClassPageRouteParams;

	const symbolDef = findSymbolByMember('name', name, packageName);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const symbol = symbolDef.symbol as ClassReferenceNode;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'classes') {
		return <Navigate replace to={`/reference${getPackagePath(packageName)}/${correctPageType}/${name}`} />;
	}

	const constructor: ConstructorReferenceNode | undefined =
		symbol.ctor && checkVisibility(symbol.ctor, symbol) ? symbol.ctor : undefined;
	const constructorSigs: CallSignatureReferenceNode[] = constructor?.signatures ?? [];

	const methods: MethodReferenceNode[] = filterChildrenByMember(symbol, 'kind', 'method');
	methods.sort(defaultNodeSort);

	const properties: PropertyReferenceNode[] = filterChildrenByMember(symbol, 'kind', 'property');
	const [propertiesWithoutEvents, events] = partition(properties, prop => hasTag(prop, 'eventListener'));
	events.sort(defaultNodeSort);

	const accessors: AccessorReferenceNode[] = filterChildrenByMember(symbol, 'kind', 'accessor');

	const allGetProps = [...propertiesWithoutEvents, ...accessors]
		.filter(prop => prop.kind === 'property' || !!prop.getSignature)
		.sort(defaultNodeSort);

	return (
		<>
			<SymbolHeader symbol={symbol} />
			<PageContent>
				{hasTag(symbol, 'deprecated') && (
					<DeprecationNotice>
						<MarkdownParser source={getTag(symbol, 'deprecated')!} />
					</DeprecationNotice>
				)}
				{hasTag(symbol, 'beta') && <BetaNotice />}
				{properties.length || methods.length || accessors.length ? (
					<>
						<h2>Overview</h2>
						<OverviewTable properties={allGetProps} events={events} methods={methods} />
					</>
				) : null}
				{symbol.comment?.text && <MarkdownParser source={symbol.comment.text} />}
				{constructorSigs.length ? (
					<>
						<h2>{constructorSigs.length === 1 ? 'Constructor' : 'Constructors'}</h2>
						{constructorSigs.map(sig => (
							<MethodCard
								key={sig.id}
								parent={symbol}
								definition={constructor!}
								sig={sig}
								isConstructor={true}
							/>
						))}
					</>
				) : null}
				{events.length ? (
					<>
						<h2>Events</h2>
						{events.map(prop => (
							<EventCard key={prop.id} definition={prop} />
						))}
					</>
				) : null}
				{propertiesWithoutEvents.length || accessors.length ? (
					<>
						<h2>Properties</h2>
						{allGetProps.map(prop => {
							if (prop.kind === 'property') {
								return <PropertyCard key={prop.id} definition={prop} />;
							}

							if (!prop.getSignature) {
								return null;
							}
							return <PropertyCard key={prop.id} name={prop.name} definition={prop} />;
						})}
					</>
				) : null}
				{methods.length ? (
					<>
						<h2>Methods</h2>
						{methods.map(method =>
							method.signatures?.map(sig => (
								<MethodCard key={sig.id} parent={symbol} definition={method} sig={sig} />
							))
						)}
					</>
				) : null}
			</PageContent>
		</>
	);
};

export default ClassPage;
