export function findByMember<T extends object, K extends keyof T>(arr: T[], key: K, value: T[K]): T | undefined {
	return arr.find(obj => obj[key] === value);
}

export function filterByMember<T extends object, K extends keyof T>(arr: T[], key: K, value: T[K]): T[] {
	return arr.filter(obj => obj[key] === value);
}
