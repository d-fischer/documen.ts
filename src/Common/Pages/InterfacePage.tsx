import React from 'react';
import { Redirect, useParams } from 'react-router';
import PageContent from '../Containers/PageContent';
import { getPageType } from '../Tools/CodeTools';
import SymbolHeader from '../Components/SymbolHeader';
import MarkdownParser from '../Tools/MarkdownParser';
import { findSymbolByMember } from '../Tools/ReferenceTools';
import { getPackagePath } from '../Tools/StringTools';
import InterfaceDetail from '../Components/InterfaceDetail';
import InterfaceRepresentation from '../Components/InterfaceRepresentation';
import { makeStyles } from '@material-ui/styles';

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

	const { symbol, packageName } = symbolDef;

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
