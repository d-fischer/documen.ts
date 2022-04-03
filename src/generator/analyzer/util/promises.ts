export async function resolvePromiseArray<T>(promises: Array<Promise<T>>): Promise<T[]>;
export async function resolvePromiseArray<T>(promises: Array<Promise<T>> | undefined): Promise<T[] | undefined>;
export async function resolvePromiseArray<T>(promises: Array<Promise<T>> | undefined): Promise<T[] | undefined> {
	return promises ? await Promise.all(promises) : undefined;
}
