import * as React from 'react';
import parseMarkdown from '../Tools/MarkdownParser';
import CodeLink from './CodeLink';
import PageHeader from '../Containers/PageHeader';
import { ReferenceNode } from '../Resources/data/reference';

interface SymbolHeaderProps {
	symbol: ReferenceNode;
}

const SymbolHeader: React.SFC<SymbolHeaderProps> = ({ symbol }) => (
	<PageHeader>
		<h1>{symbol.name}</h1>
		<CodeLink symbol={symbol}/>
		{symbol.comment && symbol.comment.shortText && parseMarkdown(symbol.comment.shortText)}
	</PageHeader>
);

export default SymbolHeader;
