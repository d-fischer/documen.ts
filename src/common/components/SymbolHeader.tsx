import React from 'react';
import PageHeader from '../containers/PageHeader';
import type { ReferenceNode } from '../reference';
import MarkdownParser from '../tools/markdown/MarkdownParser';
import CodeLink from './CodeLink';

interface SymbolHeaderProps {
	symbol: ReferenceNode;
}

const SymbolHeader: React.FC<SymbolHeaderProps> = ({ symbol }) => (
	<PageHeader>
		<h1>
			{symbol.name}
			{'typeParameters' in symbol && symbol.typeParameters?.length && (
				<>&lt;{symbol.typeParameters.map(param => param.name).join(', ')}&gt;</>
			)}
		</h1>
		<CodeLink symbol={symbol} />
		{symbol.comment?.shortText && <MarkdownParser source={symbol.comment.shortText} />}
	</PageHeader>
);

export default SymbolHeader;
