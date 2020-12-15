declare module 'commonmark-react-renderer' {
	import type { Node } from 'commonmark';

	class CommonmarkReactRenderer {
		// eslint-disable-next-line @typescript-eslint/ban-types
		constructor(options?: {})

		render(root: Node): string;
	}

	namespace CommonmarkReactRenderer {}

	export = CommonmarkReactRenderer;
}
