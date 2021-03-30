import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { Redirect, useParams } from 'react-router';
import InterfaceDetail from '../components/InterfaceDetail';
import InterfaceRepresentation from '../components/InterfaceRepresentation';
import SymbolHeader from '../components/SymbolHeader';
import PageContent from '../containers/PageContent';
import type { InterfaceReferenceNode } from '../reference';
import { getPageType } from '../tools/CodeTools';
import MarkdownParser from '../tools/MarkdownParser';
import { findSymbolByMember } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';

const useStyles = makeStyles({
	representation: {
		marginBottom: '2em'
	}
}, { name: 'InterfacePage' });

interface InterfacePageRouteParams {
	name: string;
	pkg?: string;
}

const InterfacePage: React.FC = () => {
	const classes = useStyles();
	const { name, pkg } = useParams<InterfacePageRouteParams>();

	const symbolDef = findSymbolByMember('name', name, pkg);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const symbol = symbolDef.symbol as InterfaceReferenceNode;
	const packageName = symbolDef.packageName;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'interfaces') {
		return <Redirect to={`${getPackagePath(packageName)}/reference/${correctPageType}/${name}`}/>;
	}

	return (
		<>
			<SymbolHeader symbol={symbol}/>
			<PageContent>
				{symbol.comment?.text && <MarkdownParser source={symbol.comment.text}/>}
				<InterfaceRepresentation symbol={symbol} className={classes.representation}/>
				<InterfaceDetail symbol={symbol}/>
			</PageContent>
		</>
	);
};

export default InterfacePage;