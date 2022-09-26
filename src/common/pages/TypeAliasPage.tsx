import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Type from '../components/codeBuilders/Type';
import SymbolHeader from '../components/SymbolHeader';
import PageContent from '../containers/PageContent';
import type { PackageContainerRouteParams } from '../containers/ReferencePackageContainer';
import type { TypeAliasReferenceNode } from '../reference';
import { getPageType } from '../tools/CodeTools';
import MarkdownParser from '../tools/markdown/MarkdownParser';
import { findSymbolByMember } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';

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
