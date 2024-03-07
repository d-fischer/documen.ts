import { type DependencyList, useEffect } from 'react';

export function useAsyncEffect(fn: () => Promise<void>, deps: DependencyList) {
	useEffect(() => {
		// drop promise to prevent React warning
		void fn();
	}, deps);
}
