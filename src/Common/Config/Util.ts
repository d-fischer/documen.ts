import Config from './Config';
import { ExpectedError } from 'clime';

export function getConfigValue<K extends keyof Config>(config: Config | null, key: K): Config[K] | null;
export function getConfigValue<K extends keyof Config>(config: Config | null, key: K, throws: true): Config[K];
export function getConfigValue<K extends keyof Config>(config: Config | null, key: K, throws: boolean = false): Config[K] | null {
	if (!config) {
		if (throws) {
			throw new ExpectedError(`Please set the ${key} option in your config.json or as a command line parameter`);
		}
		return null;
	}
	return config[key];
}
