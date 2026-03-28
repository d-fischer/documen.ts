import React from 'react';
import { Navigate, useParams } from 'react-router';
import BetaNotice from '../components/BetaNotice.js';
import DeprecationNotice from '../components/DeprecationNotice.js';
import OverviewTable from '../components/overviewTable/OverviewTable.js';
import SymbolHeader from '../components/SymbolHeader.js';
import Card from '../containers/Card.js';
import PageContent from '../containers/PageContent.js';
import type { PackageContainerRouteParams } from '../containers/ReferencePackageContainer.js';
import type { EnumMemberReferenceNode, EnumReferenceNode } from '../reference/index.js';
import { getPageType, getTag, hasTag } from '../tools/CodeTools.js';
import MarkdownParser from '../tools/markdown/MarkdownParser.js';
import { defaultNodeSort } from '../tools/NodeTools.js';
import { filterChildrenByMember, findSymbolByMember } from '../tools/ReferenceTools.js';
import { getPackagePath } from '../tools/StringTools.js';

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
		return <Navigate replace to={`/reference${getPackagePath(packageName)}/${correctPageType}/${name}`} />;
	}

	const members: EnumMemberReferenceNode[] = filterChildrenByMember(symbol, 'kind', 'enumMember');

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
