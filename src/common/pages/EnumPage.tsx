import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import OverviewTable from '../components/overviewTable/OverviewTable';
import SymbolHeader from '../components/SymbolHeader';
import Card from '../containers/Card';
import PageContent from '../containers/PageContent';
import type { PackageContainerRouteParams } from '../containers/ReferencePackageContainer';
import type { EnumMemberReferenceNode, EnumReferenceNode } from '../reference';
import { getPageType } from '../tools/CodeTools';
import MarkdownParser from '../tools/markdown/MarkdownParser';
import { defaultNodeSort } from '../tools/NodeTools';
import { filterChildrenByMember, findSymbolByMember } from '../tools/ReferenceTools';
import { getPackagePath } from '../tools/StringTools';

interface EnumPageRouteParams extends PackageContainerRouteParams {
	name: string;
}

const EnumPage: React.FC = () => {
	const { name, packageName } = useParams() as unknown as EnumPageRouteParams;

	const symbolDef = findSymbolByMember('name', name, packageName);

	if (!symbolDef) {
		// TODO
		return null;
	}

	const symbol = symbolDef.symbol as EnumReferenceNode;

	const correctPageType = getPageType(symbol);
	if (correctPageType !== 'enums') {
		return <Navigate replace to={`/reference${getPackagePath(packageName)}/${correctPageType}/${name}`}/>;
	}

	const members: EnumMemberReferenceNode[] = filterChildrenByMember(symbol, 'kind', 'enumMember');

	return (
		<>
			<SymbolHeader symbol={symbol}/>
			<PageContent>
				{symbol.comment?.text && <MarkdownParser source={symbol.comment.text}/>}
				{members.length ? (
					<>
						<h2>Overview</h2>
						<OverviewTable members={members} />
						<h2>{members.length === 1 ? 'Member' : 'Members'}</h2>
						{members.sort(defaultNodeSort).map(member => (
							<Card key={member.id}>
								<h3>{member.name}</h3>
								{member.comment?.shortText ? <p>{member.comment.shortText}</p> : null}
							</Card>
						))}
					</>
				) : null}
			</PageContent>
		</>
	);
};

export default EnumPage;
