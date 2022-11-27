import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import BetaNotice from '../components/BetaNotice';
import DeprecationNotice from '../components/DeprecationNotice';
import InterfaceDetail from '../components/InterfaceDetail';
import InterfaceRepresentation from '../components/InterfaceRepresentation';
import SymbolHeader from '../components/SymbolHeader';
import PageContent from '../containers/PageContent';
import type { PackageContainerRouteParams } from '../containers/ReferencePackageContainer';
import type { InterfaceReferenceNode } from '../reference';
import { getPageType, getTag, hasTag } from '../tools/CodeTools';
import MarkdownParser from '../tools/markdown/MarkdownParser';
import { findSymbolByMember } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';

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
