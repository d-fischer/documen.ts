declare module 'react-fast-highlight' {
	import * as React from 'react';

	interface ReactFastHighlightProps {
		className?: string;
		languages?: string[];
	}

	const Highlight: React.ComponentType<ReactFastHighlightProps>;
	export { Highlight };
}
