import React from 'react';
import MarkdownParser from '../Tools/MarkdownParser';

export interface ArticleContent {
	title: string;
	content: string;
}

const { Provider, Consumer } = React.createContext<ArticleContent | undefined>({ title: '', content: '' });

const PageArticle: React.FC = () => (
	<Consumer>
		{article => article && <MarkdownParser source={article.content}/>}
	</Consumer>
);

export default PageArticle;

export { Provider as ArticleProvider };
