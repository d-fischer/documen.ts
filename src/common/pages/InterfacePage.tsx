import { makeStyles } from '@mui/styles';
import React from 'react';
import { Navigate, useParams } from 'react-router';
import BetaNotice from '../components/BetaNotice.js';
import DeprecationNotice from '../components/DeprecationNotice.js';
import InterfaceDetail from '../components/InterfaceDetail.js';
import InterfaceRepresentation from '../components/InterfaceRepresentation.js';
import SymbolHeader from '../components/SymbolHeader.js';
import PageContent from '../containers/PageContent.js';
import type { PackageContainerRouteParams } from '../containers/ReferencePackageContainer.js';
import type { InterfaceReferenceNode } from '../reference/index.js';
import { getPageType, getTag, hasTag } from '../tools/CodeTools.js';
import MarkdownParser from '../tools/markdown/MarkdownParser.js';
import { findSymbolByMember } from '../tools/ReferenceTools.js';
import { getPackagePath } from '../tools/StringTools.js';

const useStyles = makeStyles(
	{
		representation: {
			marginBottom: '2em'
		}
	},
	{ name: 'InterfacePage' }
);

interface InterfacePageRouteParams extends PackageContainerRouteParams {
	name: string;
}

const InterfacePage: React.FC = () => {
	const classes = useStyles();
	const { name, packageName } = useParams() as unknown as InterfacePageRouteParams;

	const symbolDef = findSymbolByMember('name', name, packageName);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const symbol = symbolDef.symbol as InterfaceReferenceNode;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'interfaces') {
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
				{symbol.comment?.text && <MarkdownParser source={symbol.comment.text} />}
				<InterfaceRepresentation symbol={symbol} className={classes.representation} />
				<InterfaceDetail symbol={symbol} />
			</PageContent>
		</>
	);
};

export default InterfacePage;
