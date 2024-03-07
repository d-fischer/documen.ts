declare const __DOCTS_FSMAP: Array<[string, string]>;
export const fsMap = new Map(__DOCTS_FSMAP);

if (typeof window !== 'undefined') {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment
	const wnd = window as any;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	wnd.__fsMap = fsMap;
}
