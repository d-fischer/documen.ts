import * as React from 'react';

import PageHeader from '../Containers/PageHeader';
import PageContent from '../Containers/PageContent';
import { Link } from 'react-router-dom';

const WelcomePage: React.SFC = () => (
	<>
		<PageHeader>
			<h1>Twitch.js</h1>
		</PageHeader>
		<PageContent>
			<p>Welcome to the Twitch.js documentation.</p>
			<p>For now, you can browse the reference by checking the menu bar on the left. Actual documentation will follow.</p>
			<p>A good starting point is probably <Link to="/classes/TwitchClient">TwitchClient</Link>, the default export and main entry point of the library.</p>
		</PageContent>
	</>
);

export default WelcomePage;
