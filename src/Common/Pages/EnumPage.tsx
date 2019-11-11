import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { EnumMemberReferenceNode } from '../reference';
import { filterByMember } from '../Tools/ArrayTools';
import PageContent from '../Containers/PageContent';
import Card from '../Containers/Card';
import { getPageType } from '../Tools/CodeBuilders';
import SymbolHeader from '../Components/SymbolHeader';
import parseMarkdown from '../Tools/MarkdownParser';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import { findSymbolByMember } from '../Tools/ReferenceTools';
import { getPackagePath } from '../Tools/StringTools';

interface EnumPageRouteProps {
	name: string;
}

const EnumPage: React.FC<RouteComponentProps<EnumPageRouteProps>> = ({ match: { params: { name } } }) => {
	const symbolDef = findSymbolByMember('name', name);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const { symbol, packageName } = symbolDef;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'enums') {
		return <Redirect to={`${(getPackagePath(packageName))}/${correctPageType}/${name}`}/>;
	}

	const members: EnumMemberReferenceNode[] = filterByMember(symbol.children, 'kind', ReferenceNodeKind.EnumMember);

	return (
		<>
			<SymbolHeader symbol={symbol}/>
			<PageContent>
				{symbol.comment && symbol.comment.text && parseMarkdown(symbol.comment.text)}
				{members.length ? (
					<>
						<h2>{members.length === 1 ? 'Member' : 'Members'}</h2>
						{members.map(member => (
							<Card key={member.id}>
								<h3>{member.name}</h3>
								{member.comment && member.comment.shortText ? <p>{member.comment.shortText}</p> : null}
							</Card>
						))}
					</>
				) : null}
			</PageContent>
		</>
	);
};

export default EnumPage;
