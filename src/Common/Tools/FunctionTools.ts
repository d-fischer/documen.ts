import React, { useEffect } from 'react';

export function useAsyncEffect(fn: Function, deps: React.DependencyList) {
	useEffect(() => {
		// drop promise to prevent React warning
		fn();
	}, deps);
}
