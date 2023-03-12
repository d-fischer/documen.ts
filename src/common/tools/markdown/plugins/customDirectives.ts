import { toHast } from 'mdast-util-to-hast';
import { type MdastNodes } from 'mdast-util-to-hast/lib';
import remarkDirective from 'remark-directive';
import type { Processor, Transformer } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

interface CustomDirectivesOptions {
	classes: Record<string, string>;
}

export function customDirectives(this: Processor, { classes }: CustomDirectivesOptions): Transformer {
	this.use(remarkDirective);

	function visitor(node: Node & Record<string, unknown>) {
		const directiveName = node.name as string;

		if (directiveName === 'warning') {
			node.data = {
				...node.data,
				hProperties: {
					className: classes.warning
				},
				hChildren: [
					{
						type: 'element',
						tagName: 'h3',
						properties: {
							className: classes.warningTitle
						},
						children: [
							{
								type: 'text',
								value: (node.attributes as Record<string, string | undefined>).title ?? 'Warning'
							}
						]
					},
					...((node.children as MdastNodes[] | undefined)?.map(c => toHast(c)) ?? [])
				]
			};
		}

		return true;
	}

	return function transform(tree) {
		visit(tree, 'containerDirective', visitor);
	};
}
