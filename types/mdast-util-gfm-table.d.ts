declare module 'mdast-util-gfm-table' {
	export interface Options {
		tableCellPadding?: boolean | undefined;
		tablePipeAlign?: boolean | undefined;
	}
}

declare module 'mdast-util-gfm-table/from-markdown' {
	import type { MdastExtension } from 'mdast-util-from-markdown';

	const gfmTableFromMarkdown: MdastExtension;

	export = gfmTableFromMarkdown;
}

declare module 'mdast-util-gfm-table/to-markdown' {
	import type { Options as ToMarkdownExtension } from 'mdast-util-to-markdown';
	import type { Options as GfmTableOptions } from 'mdast-util-gfm-table';

	function gfmTableToMarkdown(options: GfmTableOptions): ToMarkdownExtension;

	export = gfmTableToMarkdown;
}
