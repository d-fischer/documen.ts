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
