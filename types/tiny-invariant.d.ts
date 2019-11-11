declare module 'tiny-invariant' {
	let invariant: invariant.InvariantStatic;
	namespace invariant {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		type InvariantStatic = (testValue: any, format?: string, ...extra: any[]) => void;
	}

	export = invariant;
}
