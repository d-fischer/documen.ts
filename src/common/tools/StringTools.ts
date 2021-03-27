export function removeSlash(str: string): string {
	return str.replace(/\/$/, '');
}

export function getPackagePath(packageName?: string) {
	return packageName ? `/${packageName}` : '';
}

export function getRandomString(length: number, permitted = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
	return Array.from({ length }, () => permitted[Math.floor(Math.random() * permitted.length)]).join('')
}
