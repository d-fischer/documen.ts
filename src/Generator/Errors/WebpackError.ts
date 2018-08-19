import CustomError from '../../Common/CustomError';

export default class WebpackError extends CustomError {
	constructor(private readonly _error: Error) {
		super(_error.message);
	}

	get originalError() {
		return this._error;
	}
}
