import type { Location, To } from 'history';
import { createPath, parsePath } from 'history';
import React from 'react';
import { Router } from 'react-router';

interface StaticRouterWithSuffixProps {
	basename?: string;
	location: string | Partial<Location>;
	suffix?: string;
}

const stripSuffix = (suffix: string, location: Location): Location => {
	if (suffix && location.pathname.endsWith(suffix)) {
		return {
			...location,
			pathname: location.pathname.slice(0, -suffix.length)
		};
	}

	return location;
};

const createUrl = (location: To, suffix?: string): string => {
	if (typeof location === 'string') {
		return (location.endsWith('/') || !suffix) ? location : `${location}${suffix}`;
	}
	if (!location.pathname) {
		return '/';
	}
	if (!location.pathname.endsWith('/') && suffix) {
		location.pathname += suffix;
	}

	return createPath(location);
};

const StaticRouterWithSuffix: React.FunctionComponent<StaticRouterWithSuffixProps> = ({ children, location: loc, suffix, basename }) => {
	if (typeof loc === 'string') {
		loc = parsePath(loc);
	}

	let location: Location = {
		pathname: loc.pathname ?? '/',
		search: loc.search ?? '',
		hash: loc.hash ?? '',
		state: loc.state ?? null,
		key: loc.key ?? 'default'
	};

	if (suffix) {
		location = stripSuffix(suffix, location);
	}

	const staticNavigator = {
		createHref(to: To) {
			return createUrl(to, suffix);
		},
		push(to: To) {
			throw new Error(
				'You cannot use navigator.push() on the server because it is a stateless ' +
				'environment. This error was probably triggered when you did a ' +
				`\`navigate(${JSON.stringify(to)})\` somewhere in your app.`
			);
		},
		replace(to: To) {
			throw new Error(
				'You cannot use navigator.replace() on the server because it is a stateless ' +
				'environment. This error was probably triggered when you did a ' +
				`\`navigate(${JSON.stringify(to)}, { replace: true })\` somewhere ` +
				'in your app.'
			);
		},
		go(delta: number) {
			throw new Error(
				'You cannot use navigator.go() on the server because it is a stateless ' +
				'environment. This error was probably triggered when you did a ' +
				`\`navigate(${delta})\` somewhere in your app.`
			);
		},
		back() {
			throw new Error(
				'You cannot use navigator.back() on the server because it is a stateless ' +
				'environment.'
			);
		},
		forward() {
			throw new Error(
				'You cannot use navigator.forward() on the server because it is a stateless ' +
				'environment.'
			);
		},
		block() {
			throw new Error(
				'You cannot use navigator.block() on the server because it is a stateless ' +
				'environment.'
			);
		}
	};

	return (
		<Router
			basename={basename}
			location={location}
			navigator={staticNavigator}
			static={true}
		>
			{children}
		</Router>
	);
};

export default StaticRouterWithSuffix;
