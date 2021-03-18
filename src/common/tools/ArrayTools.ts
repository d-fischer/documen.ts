export function partition<EntryType, TrueEntryType extends EntryType = EntryType>(arr: Iterable<EntryType>, predicate: (val: EntryType) => val is TrueEntryType): [EntryType[], TrueEntryType[]] {
	const falseResult: EntryType[] = [];
	const trueResult: TrueEntryType[] = [];
	for (const entry of arr) {
		(predicate(entry) ? trueResult : falseResult).push(entry);
	}
	return [falseResult, trueResult];
}

export function partitionedFlatMap<T, R>(arr: T[], keyMapper: (val: T) => string, valueMapper: (val: T) => R | R[]): Record<string, R[]> {
	const result: Record<string, R[]> = {};
	for (const entry of arr) {
		const key = keyMapper(entry);
		let values = valueMapper(entry);

		if (!Array.isArray(values)) {
			values = [values];
		}

		if (Object.prototype.hasOwnProperty.call(result, key)) {
			result[key].push(...values);
		} else {
			result[key] = values;
		}
	}
	return result;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function findByMember<T extends object, K extends keyof T, R extends T>(arr: T[], key: K, value: T[K]): R | undefined {
	return arr.find(obj => obj[key] === value) as R | undefined;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function filterByMember<T extends object, K extends keyof T, R extends T>(arr: T[], key: K, value: T[K]): R[] {
	return arr.filter(obj => obj[key] === value) as R[];
}

export type ExtractIterable<T> = T extends Iterable<infer I> ? I : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function* zip<T extends Array<Iterable<unknown>>>(...args: T): Iterable<{ [K in keyof T]: ExtractIterable<T[K]> }> {
	const iterators = args.map((x) => x[Symbol.iterator]());

	while (true) {
		const next = iterators.map((i) => i.next());
		if (next.some(nx => nx.done)) {
			break;
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any
		yield next.map(nx => nx.value) as any;
	}
}
