declare module 'cartesian-product' {
	namespace cartesianProduct {}
	function cartesianProduct<T1, T2>(arr: [T1[], T2[]]): Array<[T1, T2]>;
	function cartesianProduct<T1, T2, T3>(arr: [T1[], T2[], T3[]]): Array<[T1, T2, T3]>;
	function cartesianProduct<T1, T2, T3, T4>(arr: [T1[], T2[], T3[], T4[]]): Array<[T1, T2, T3, T4]>;
	function cartesianProduct<T1, T2, T3, T4, T5>(arr: [T1[], T2[], T3[], T4[], T5[]]): Array<[T1, T2, T3, T4, T5]>;

	export = cartesianProduct;
}
