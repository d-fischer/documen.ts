import { makeStyles } from '@material-ui/styles';
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import NavMenu from '../components/NavMenu';
import NavMenuGroup from '../components/NavMenuGroup';
import NavMenuItem from '../components/NavMenuItem';
import PageArticle, { PageArticleContext } from '../components/PageArticle';
import { ConfigContext, mockFs } from '../config';
import type { ConfigInternalArticle } from '../config/Config';
import PageContent from '../containers/PageContent';

import PageHeader from '../containers/PageHeader';

interface DocPageRouteParams {
	category: string;
	group?: string;
	article?: string;
}

const useStyles = makeStyles({
	root: {
		display: 'flex',
		flexDirection: 'row',
		flex: 1
	},
	nav: {
		width: 250
	},
	main: {
		flex: 1
	}
});

const DocPage: React.FC = () => {
	const classes = useStyles();
	const { group: groupName, category: categoryName, article: articleName } = useParams() as unknown as DocPageRouteParams;
	const article = useContext(PageArticleContext);
	const config = useContext(ConfigContext);

	let title = article?.title;
	let mockContent: string | undefined = undefined;
	const confCategory = config.categories?.find(cat => cat.name === categoryName);
	if (!confCategory) {
		return null;
	}

	if (!title) {
		if (groupName) {
			const confArticle = confCategory.groups?.find(grp => grp.name === groupName)?.articles?.find(art => art.name === articleName);

			if (!confArticle) {
				return null;
			}

			title = confArticle.title;
			if (mockFs) {
				const fileName = (confArticle as ConfigInternalArticle).file;
				if (fileName) {
					mockContent = mockFs.get(fileName);
				}
			}
		} else {
			title = confCategory.indexTitle ?? categoryName;
			if (mockFs) {
				const fileName = confCategory.indexFile;
				if (fileName) {
					mockContent = mockFs.get(fileName);
				}
			}
		}
	}

	return (
		<div className={classes.root}>
			<NavMenu className={classes.nav}>
				<NavMenuItem path={`/docs/${confCategory.name}/`}>{confCategory.indexTitle ?? confCategory.name}</NavMenuItem>
				{confCategory.groups?.map(grp => (
					<NavMenuGroup key={grp.name} title={grp.title}>
						{grp.articles?.map(art => 'externalLink' in art ? (
							<NavMenuItem key={art.name} external path={art.externalLink} title={art.title}>
								{art.title}
							</NavMenuItem>
						) : (
							<NavMenuItem key={art.name} path={`/docs/${confCategory.name}/${grp.name}/${art.name}`} title={art.title}>
								{art.title}
							</NavMenuItem>
						))}
					</NavMenuGroup>
				)) ?? null}
			</NavMenu>
			<div className={classes.main}>
				<PageHeader>
					<h1>{title}</h1>
				</PageHeader>
				<PageContent>
					<PageArticle mockContent={mockContent}/>
				</PageContent>
			</div>
		</div>
	);
};

export default DocPage;
