declare module 'commonmark-react-renderer' {
	import { Node } from 'commonmark';

	class CommonmarkReactRenderer {
		constructor(options?: {})

		render(root: Node): string;
	}

	namespace CommonmarkReactRenderer {}

	export = CommonmarkReactRenderer;
}
