import CustomError from '../../common/CustomError';
import type webpack from 'webpack';

export default class WebpackBuildError extends CustomError {
	constructor(private readonly _stats?: webpack.Stats) {
		super('Build errors occured in webpack');
	}

	get stats() {
		return this._stats;
	}
}
