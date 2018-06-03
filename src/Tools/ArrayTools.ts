export function findByMember<T extends object, K extends keyof T, R extends T>(arr: T[], key: K, value: T[K]): R | undefined {
	return arr.find(obj => obj[key] === value) as R | undefined;
}

export function filterByMember<T extends object, K extends keyof T, R extends T>(arr: T[], key: K, value: T[K]): R[] {
	return arr.filter(obj => obj[key] === value) as R[];
}
