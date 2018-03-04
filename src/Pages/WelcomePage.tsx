import * as React from 'react';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';

const WelcomePage: React.SFC = () => (
	<>
		<PageHeader>
			<h1>Twitch.js</h1>
		</PageHeader>
		<PageContent>
			<p>There isn't a lot to see on this page yet.</p>
		</PageContent>
	</>
);

export default WelcomePage;
