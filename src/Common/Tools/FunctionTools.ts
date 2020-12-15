import type React from 'react';
import { useEffect } from 'react';

export function useAsyncEffect(fn: () => Promise<void>, deps: React.DependencyList) {
	useEffect(() => {
		// drop promise to prevent React warning
		void fn();
	}, deps);
}
