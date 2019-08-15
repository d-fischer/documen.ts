export function removeSlash(str: string): string {
	return str.replace(/\/$/, '');
}

export function getPackagePath(packageName?: string) {
	return packageName ? `/${packageName}` : '';
}
