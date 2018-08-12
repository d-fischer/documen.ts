import * as React from 'react';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';

const WelcomePage: React.SFC = () => (
	<>
		<PageHeader>
			<h1>Twitch.js</h1>
		</PageHeader>
		<PageContent>
			<p>Welcome to the Twitch.js documentation.</p>
			<p>For now, you can browse the reference by checking the menu bar on the left. Actual documentation will follow.</p>
		</PageContent>
	</>
);

export default WelcomePage;
