declare module 'tiny-invariant' {
	let invariant: invariant.InvariantStatic;
	namespace invariant {
		// tslint:disable-next-line:no-any
		type InvariantStatic = (testValue: any, format?: string, ...extra: any[]) => void;
	}

	export = invariant;
}
