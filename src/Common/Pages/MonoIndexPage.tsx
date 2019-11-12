import React from 'react';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import MonoMenu from '../Components/MonoMenu';

const MonoIndexPage: React.FunctionComponent = () => (
	<>
		<MonoMenu/>
		<PageHeader>
			<h1>MONO</h1>
		</PageHeader>
		<PageContent>
			MONO!
		</PageContent>
	</>
);

export default MonoIndexPage;
