import type { Options as GfmTableOptions } from 'mdast-util-gfm-table';
import fromMarkdown from 'mdast-util-gfm-table/from-markdown';
import toMarkdown from 'mdast-util-gfm-table/to-markdown';
import gfmTable from 'micromark-extension-gfm-table/syntax';
import type { Processor } from 'unified';

export function gfmTables(this: Processor, options: GfmTableOptions): void {
	const data = this.data();

	function add(field: string, value: unknown) {
		/* istanbul ignore if - other extensions. */
		if (data[field]) (data[field] as unknown[]).push(value)
		else data[field] = [value]
	}

	add('micromarkExtensions', gfmTable)
	add('fromMarkdownExtensions', fromMarkdown)
	add('toMarkdownExtensions', toMarkdown(options))
}
