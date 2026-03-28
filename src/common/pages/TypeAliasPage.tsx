import { makeStyles } from '@mui/styles';
import React from 'react';
import { Navigate, useParams } from 'react-router';
import BetaNotice from '../components/BetaNotice.js';
import Type from '../components/codeBuilders/Type.js';
import DeprecationNotice from '../components/DeprecationNotice.js';
import SymbolHeader from '../components/SymbolHeader.js';
import PageContent from '../containers/PageContent.js';
import type { PackageContainerRouteParams } from '../containers/ReferencePackageContainer.js';
import type { TypeAliasReferenceNode } from '../reference/index.js';
import { getPageType, getTag, hasTag } from '../tools/CodeTools.js';
import MarkdownParser from '../tools/markdown/MarkdownParser.js';
import { findSymbolByMember } from '../tools/ReferenceTools.js';
import { getPackagePath } from '../tools/StringTools.js';

interface TypeAliasPageRouteParams extends PackageContainerRouteParams {
	name: string;
}

const useStyles = makeStyles(
	theme => ({
		aliasedType: {
			fontFamily: theme.fonts.code
		}
	}),
	{ name: 'TypeAliasPage' }
);

const TypeAliasPage: React.FC = () => {
	const { name, packageName } = useParams() as unknown as TypeAliasPageRouteParams;
	const classes = useStyles();

	const symbolDef = findSymbolByMember('name', name, packageName);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const symbol = symbolDef.symbol as TypeAliasReferenceNode;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'types') {
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
				<p>
					Aliased type:{' '}
					<span className={classes.aliasedType}>
						<Type def={symbol.type} />
					</span>
				</p>
			</PageContent>
		</>
	);
};

export default TypeAliasPage;
