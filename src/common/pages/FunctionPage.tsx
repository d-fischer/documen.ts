import React from 'react';
import { Navigate, useParams } from 'react-router';
import BetaNotice from '../components/BetaNotice.js';
import { FunctionCardHeader } from '../components/cards/FunctionCardHeader.js';
import DeprecationNotice from '../components/DeprecationNotice.js';
import FunctionParamDesc from '../components/FunctionParamDesc.js';
import { FunctionReturnType } from '../components/FunctionReturnType.js';
import SymbolHeader from '../components/SymbolHeader.js';
import Card from '../containers/Card.js';
import PageContent from '../containers/PageContent.js';
import type { PackageContainerRouteParams } from '../containers/ReferencePackageContainer.js';
import type { FunctionReferenceNode } from '../reference/index.js';
import { getPageType, getTag, hasTag } from '../tools/CodeTools.js';
import MarkdownParser from '../tools/markdown/MarkdownParser.js';
import { findSymbolByMember } from '../tools/ReferenceTools.js';
import { getPackagePath } from '../tools/StringTools.js';

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
		return <Navigate replace to={`/reference${getPackagePath(packageName)}/${correctPageType}/${name}`} />;
	}

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
				<h2>Definition</h2>
				{symbol.signatures?.map(sig => (
					<Card key={sig.id}>
						<FunctionCardHeader definition={symbol} sig={sig} />
						{sig.comment?.shortText && <MarkdownParser source={sig.comment.shortText} />}
						{sig.comment?.text && <MarkdownParser source={sig.comment.text} />}
						<FunctionParamDesc functionDefinition={symbol} signature={sig} />
						<FunctionReturnType signature={sig} />
					</Card>
				))}
			</PageContent>
		</>
	);
};

export default FunctionPage;
