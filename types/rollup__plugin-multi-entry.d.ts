declare module '@rollup/plugin-multi-entry' {
	import type { Plugin } from 'rollup';

	function multi(): Plugin;

	export = multi;
}
