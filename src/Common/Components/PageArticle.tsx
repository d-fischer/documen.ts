import React from 'react';
import MarkdownParser from '../Tools/MarkdownParser';

export interface ArticleContent {
	title: string;
	content: string;
}

const PageArticleContext = React.createContext<ArticleContent | undefined>({ title: '', content: '' });

const PageArticle: React.FC = () => (
	<PageArticleContext.Consumer>
		{article => article && <MarkdownParser source={article.content}/>}
	</PageArticleContext.Consumer>
);

export default PageArticle;

export { PageArticleContext };
