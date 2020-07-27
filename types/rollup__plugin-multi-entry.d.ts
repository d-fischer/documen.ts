declare module '@rollup/plugin-multi-entry' {
	import { Plugin } from 'rollup';

	function multi(): Plugin;

	export = multi;
}
