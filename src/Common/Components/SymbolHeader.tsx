import React from 'react';
import parseMarkdown from '../Tools/MarkdownParser';
import CodeLink from './CodeLink';
import PageHeader from '../Containers/PageHeader';
import { ReferenceNode } from '../reference';

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
		{symbol.comment && symbol.comment.shortText && parseMarkdown(symbol.comment.shortText)}
	</PageHeader>
);

export default SymbolHeader;
