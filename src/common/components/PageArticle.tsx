import React, { createContext } from 'react';
import MarkdownParser from '../tools/markdown/MarkdownParser';

export interface ArticleContent {
	title: string;
	content: string;
}

const PageArticleContext = createContext<ArticleContent | undefined>({ title: '', content: '' });

interface PageArticleProps {
	mockContent?: string;
}

const PageArticle: React.FC<PageArticleProps> = ({ mockContent }) => (
	<PageArticleContext.Consumer>
		{article => article && <MarkdownParser source={mockContent ?? article.content}/>}
	</PageArticleContext.Consumer>
);

export default PageArticle;

export { PageArticleContext };
