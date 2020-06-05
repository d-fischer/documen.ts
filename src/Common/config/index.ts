import Config from './Config';

interface Paths {
	projectBase: string;
	sourceBase: string;
}

declare global {
	const __DOCTS_CONFIG: Config;
	const __DOCTS_PATHS: Paths;
}

const config = __DOCTS_CONFIG;
export default config;

export const isMono = !!config.monorepoRoot;

const { projectBase, sourceBase } = __DOCTS_PATHS;
export { projectBase, sourceBase };
