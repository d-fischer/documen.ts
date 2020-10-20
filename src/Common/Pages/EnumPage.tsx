import React from 'react';
import { Redirect, useParams } from 'react-router';
import OverviewTable from '../Components/OverviewTable/OverviewTable';
import { EnumMemberReferenceNode } from '../reference';
import PageContent from '../Containers/PageContent';
import Card from '../Containers/Card';
import { getPageType } from '../Tools/CodeTools';
import SymbolHeader from '../Components/SymbolHeader';
import MarkdownParser from '../Tools/MarkdownParser';
import { ReferenceNodeKind } from '../reference/ReferenceNodeKind';
import { findSymbolByMember } from '../Tools/ReferenceTools';
import { getPackagePath } from '../Tools/StringTools';
import { defaultNodeSort, filterChildrenByMember } from '../Tools/NodeTools';

interface EnumPageRouteParams {
	name: string;
	pkg?: string;
}

const EnumPage: React.FC = () => {
	const { name, pkg } = useParams<EnumPageRouteParams>();

	const symbolDef = findSymbolByMember('name', name, pkg);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const { symbol, packageName } = symbolDef;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'enums') {
		return <Redirect to={`${getPackagePath(packageName)}/reference/${correctPageType}/${name}`}/>;
	}

	const members: EnumMemberReferenceNode[] = filterChildrenByMember(symbol, 'kind', ReferenceNodeKind.EnumMember);

	return (
		<>
			<SymbolHeader symbol={symbol}/>
			<PageContent>
				{symbol.comment && symbol.comment.text && <MarkdownParser source={symbol.comment.text}/>}
				{members.length ? (
					<>
						<h2>Overview</h2>
						<OverviewTable members={members} />
						<h2>{members.length === 1 ? 'Member' : 'Members'}</h2>
						{members.sort(defaultNodeSort).map(member => (
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
