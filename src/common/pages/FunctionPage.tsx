import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { FunctionCardHeader } from '../components/cards/FunctionCardHeader';
import FunctionParamDesc from '../components/FunctionParamDesc';
import { FunctionReturnType } from '../components/FunctionReturnType';
import SymbolHeader from '../components/SymbolHeader';
import Card from '../containers/Card';
import PageContent from '../containers/PageContent';
import type { PackageContainerRouteParams } from '../containers/ReferencePackageContainer';
import type { FunctionReferenceNode } from '../reference';
import { getPageType } from '../tools/CodeTools';
import MarkdownParser from '../tools/markdown/MarkdownParser';
import { findSymbolByMember } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';

interface FunctionPageRouteParams extends PackageContainerRouteParams {
	name: string;
}

const FunctionPage: React.FC = () => {
	const { name, packageName } = useParams() as unknown as FunctionPageRouteParams;

	const symbolDef = findSymbolByMember('name', name, packageName);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const symbol = symbolDef.symbol as FunctionReferenceNode;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'functions') {
		return <Navigate replace to={`/reference${getPackagePath(packageName)}/${correctPageType}/${name}`}/>;
	}

	return (
		<>
			<SymbolHeader symbol={symbol}/>
			<PageContent>
				<h2>Definition</h2>
				{symbol.signatures?.map(sig => (
					<Card key={sig.id}>
						<FunctionCardHeader definition={symbol} sig={sig}/>
						{sig.comment?.shortText && <MarkdownParser source={sig.comment.shortText}/>}
						{sig.comment?.text && <MarkdownParser source={sig.comment.text}/>}
						<FunctionParamDesc functionDefinition={symbol} signature={sig}/>
						<FunctionReturnType signature={sig}/>
					</Card>
				))}
			</PageContent>
		</>
	);
};

export default FunctionPage;
