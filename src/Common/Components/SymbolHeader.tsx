import React from 'react';
import MarkdownParser from '../Tools/MarkdownParser';
import CodeLink from './CodeLink';
import PageHeader from '../Containers/PageHeader';
import type { ReferenceNode } from '../reference';

interface SymbolHeaderProps {
	symbol: ReferenceNode;
}

const SymbolHeader: React.FC<SymbolHeaderProps> = ({ symbol }) => (
	<PageHeader>
		<h1>
			{symbol.name}
			{'typeParameter' in symbol && symbol.typeParameter && symbol.typeParameter.length && (
				<>
					&lt;{symbol.typeParameter.map(param => param.name).join(', ')}&gt;
				</>
			)}
		</h1>
		<CodeLink symbol={symbol}/>
		{symbol.comment?.shortText && <MarkdownParser source={symbol.comment.shortText}/>}
	</PageHeader>
);

export default SymbolHeader;
