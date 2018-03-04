import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import CodeLink from '../Components/CodeLink';
import reference, { ReferenceNodeKind, ReferenceSignatureNode } from '../Resources/data/reference';
import { filterByMember, findByMember } from '../Tools/ArrayTools';
import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import Card from '../Containers/Card';
import FunctionParamDesc from '../Components/FunctionParamDesc';
import FunctionSignature from '../Components/FunctionSignature';
import { buildType, hasTag } from '../Tools/CodeBuilders';

interface ClassPageRouteProps {
	clazz: string;
}

const ClassPage: React.SFC<RouteComponentProps<ClassPageRouteProps>> = ({ match: { params: { clazz } } }) => {
	const symbol = findByMember(reference.children, 'name', clazz);

	if (!symbol) {
		// TODO
		return null;
	}

	const constructor = findByMember(symbol.children, 'kind', ReferenceNodeKind.Constructor);
	let constructorSigs: ReferenceSignatureNode[] = [];
	if (constructor) {
		constructorSigs = constructor.signatures!;
	}

	const properties = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Property);
	const propertiesWithoutEvents = properties.filter(prop => !hasTag(prop, 'eventListener'));

	const accessors = filterByMember(symbol.children, 'kind', ReferenceNodeKind.Accessor);

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
				{propertiesWithoutEvents.length || accessors.length ? (
					<>
						<h2>Properties</h2>
						{propertiesWithoutEvents.map(prop => (
							<Card key={prop.id}>
								<h3>{prop.name}</h3>
								{prop.type ? <h4>Type: {buildType(prop.type)}</h4> : null}
								{prop.comment && prop.comment.shortText ? <p>{prop.comment.shortText}</p> : null}
							</Card>
						))}
						{accessors.map(acc => {
							if (!acc.getSignature || acc.getSignature.length < 1) {
								return null;
							}
							const getSig = acc.getSignature[0];
							return (
								<Card key={acc.id}>
									<h3>{acc.name}</h3>
									{getSig.type ? <h4>Type: {buildType(getSig.type)}</h4> : null}
									{getSig.comment && getSig.comment.shortText ? <p>{getSig.comment.shortText}</p> : null}
								</Card>
							);
						})}
					</>
				) : null}
			</PageContent>
		</>
	);
};

export default ClassPage;
