import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import CodeLink from '../Components/CodeLink';
import reference, { AccessorReferenceNode, ConstructorReferenceNode, MethodReferenceNode, PropertyReferenceNode, ReferenceNodeKind, SignatureReferenceNode } from '../Resources/data/reference';
import { filterByMember, findByMember } from '../Tools/ArrayTools';
import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import Card from '../Containers/Card';
import FunctionParamDesc from '../Components/FunctionParamDesc';
import FunctionSignature from '../Components/FunctionSignature';
import { hasTag } from '../Tools/CodeBuilders';
import PropertyCard from '../Components/PropertyCard';

interface ClassPageRouteProps {
	clazz: string;
}

const ClassPage: React.SFC<RouteComponentProps<ClassPageRouteProps>> = ({ match: { params: { clazz } } }) => {
	const symbol = findByMember(reference.children, 'name', clazz);

	if (!symbol) {
		// TODO
		return null;
	}

	const constructor: ConstructorReferenceNode | undefined = findByMember(symbol.children, 'kind', ReferenceNodeKind.Constructor);
	let constructorSigs: SignatureReferenceNode[] = [];
	if (constructor) {
		constructorSigs = constructor.signatures;
	}

	const methods: MethodReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Method);

	const properties: PropertyReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Property);
	const propertiesWithoutEvents = properties.filter(prop => !hasTag(prop, 'eventListener'));

	const accessors: AccessorReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Accessor);

	return (
		<>
			<PageHeader>
				<h1>{symbol.name}</h1>
				<CodeLink symbol={symbol}/>
				{symbol.comment && symbol.comment.shortText && <p>{symbol.comment.shortText}</p>}
			</PageHeader>
			<PageContent>
				{constructorSigs.length ? (
					<>
						<h2>{constructorSigs.length === 1 ? 'Constructor' : 'Constructors'}</h2>
						{constructorSigs.map(sig => (
							<Card key={sig.id}>
								<FunctionSignature signature={sig} isConstructor={true}/>
								<FunctionParamDesc signature={sig}/>
							</Card>
						))}
					</>
				) : null}
				{methods.length ? (
					<>
						<h2>Methods</h2>
						{methods.map(method => method.signatures && method.signatures.map(sig => (
							<Card key={sig.id}>
								<FunctionSignature signature={sig}/>
								<FunctionParamDesc signature={sig}/>
							</Card>
						)))}
					</>
				) : null}
				{propertiesWithoutEvents.length || accessors.length ? (
					<>
						<h2>Properties</h2>
						{propertiesWithoutEvents.map(prop => <PropertyCard key={prop.id} definition={prop}/>)}
						{accessors.map(acc => {
							if (!acc.getSignature || acc.getSignature.length < 1) {
								return null;
							}
							return <PropertyCard key={acc.id} name={acc.name} definition={acc.getSignature[0]}/>;
						})}
					</>
				) : null}
			</PageContent>
		</>
	);
};

export default ClassPage;
