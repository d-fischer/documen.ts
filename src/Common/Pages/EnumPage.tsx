import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import reference, {
	EnumMemberReferenceNode
} from '../Reference';
import { filterByMember, findByMember } from '../Tools/ArrayTools';
import PageContent from '../Containers/PageContent';
import Card from '../Containers/Card';
import { getPageType } from '../Tools/CodeBuilders';
import SymbolHeader from '../Components/SymbolHeader';
import parseMarkdown from '../Tools/MarkdownParser';
import { ReferenceNodeKind } from '../Reference/ReferenceNodeKind';

interface EnumPageRouteProps {
	name: string;
}

const EnumPage: React.SFC<RouteComponentProps<EnumPageRouteProps>> = ({ match: { params: { name } } }) => {
	const symbol = findByMember(reference.children, 'name', name);

	if (!symbol) {
		// TODO
		return null;
	}

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'enums') {
		return <Redirect to={`/${correctPageType}/${name}`}/>;
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
