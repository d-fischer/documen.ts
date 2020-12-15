import { Config } from './Config';
import { ExpectedError } from 'clime';

export function getConfigValue<K extends keyof Config>(config: Config | null, key: K): NonNullable<Config[K]> | null;
export function getConfigValue<K extends keyof Config>(config: Config | null, key: K, throws: true): NonNullable<Config[K]>;
export function getConfigValue<K extends keyof Config>(config: Config | null, key: K, throws: boolean = false): NonNullable<Config[K]> | null {
	const value = config?.[key];
	if (value == null) {
		if (throws) {
			throw new ExpectedError(`Please set the ${key} option in your config.json or as a command line parameter`);
		}
		return null;
	}
	return value!;
}
