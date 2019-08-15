import Config from './Config';

declare global {
	const __DOCTS_CONFIG: Config;
}

const config = __DOCTS_CONFIG;
export default config;

export const isMono = !!config.monorepoRoot;
