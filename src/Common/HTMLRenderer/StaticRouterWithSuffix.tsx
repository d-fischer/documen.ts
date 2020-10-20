import invariant from 'tiny-invariant';
import React from 'react';
import PropTypes from 'prop-types';
import { createLocation, createPath, History, Location, LocationDescriptorObject } from 'history';
import { Router } from 'react-router';

const addLeadingSlash = (path: string) =>
	path.startsWith('/') ? path : `/${path}`;

const removeTrailingSlash = (path: string) =>
	path.endsWith('/') ? path.slice(0, -1) : path;

const addBasename = (basename: string, location: Location) => {
	if (!basename) {
		return location;
	}

	return {
		...location,
		pathname: addLeadingSlash(basename) + location.pathname
	};
};

const stripBasename = (basename: string, location: Location) => {
	if (!basename) {
		return location;
	}

	const base = addLeadingSlash(basename);

	if (base === '/' || location.pathname.indexOf(base) !== 0) {
		return location;
	}

	return {
		...location,
		pathname: location.pathname.substr(base.length)
	};
};

const stripSuffix = (suffix: string, location: Location) => {
	if (suffix && location.pathname.endsWith(suffix)) {
		return {
			...location,
			pathname: location.pathname.slice(0, -suffix.length)
		};
	}

	return location;
};

const createUrl = (location: LocationDescriptorObject | string, suffix?: string) => {
	const loc = createLocation(location);
	if (!loc.pathname.endsWith('/') && suffix) {
		loc.pathname += suffix;
	}

	return createPath(loc);
};

const staticHandler = (methodName: string) => () => {
	invariant(false, 'You cannot %s with a static router', methodName);
};

const noop = () => {
};

interface StaticRouterContext {
	action?: string;
	location?: LocationDescriptorObject;
	url?: string;
}

interface StaticRouterWithSuffixProps {
	basename: string;
	context: StaticRouterContext;
	location: string | LocationDescriptorObject;
	suffix?: string;
}

class StaticRouterWithSuffix extends React.Component<StaticRouterWithSuffixProps> {
	static defaultProps = {
		basename: '',
		location: '/'
	};

	static childContextTypes = {
		router: PropTypes.object.isRequired
	};

	getChildContext() {
		return {
			router: {
				staticContext: this.props.context
			}
		};
	}

	createHref = (path: LocationDescriptorObject | string) => addLeadingSlash(`${removeTrailingSlash(this.props.basename)}${createUrl(path, this.props.suffix)}`);

	handlePush = (location: LocationDescriptorObject | string) => {
		const { basename, context, suffix } = this.props;
		context.action = 'PUSH';
		context.location = addBasename(basename, createLocation(location));
		context.url = createUrl(context.location, suffix);
	};

	handleReplace = (location: LocationDescriptorObject | string) => {
		const { basename, context, suffix } = this.props;
		context.action = 'REPLACE';
		context.location = addBasename(basename, createLocation(location));
		context.url = createUrl(context.location, suffix);
	};

	handleListen = () => noop;

	handleBlock = () => noop;

	render() {
		const { basename, location, suffix = '', ...props } = this.props;

		const history: History = {
			createHref: this.createHref,
			action: 'POP',
			location: stripSuffix(suffix, stripBasename(basename, createLocation(location))),
			push: this.handlePush,
			replace: this.handleReplace,
			go: staticHandler('go'),
			goBack: staticHandler('goBack'),
			goForward: staticHandler('goForward'),
			listen: this.handleListen,
			block: this.handleBlock,
			length: 0
		};

		return <Router {...props} history={history}/>;
	}
}

export default StaticRouterWithSuffix;
