declare module 'react-router-hash-link' {
	import type { LinkProps, NavLinkProps } from 'react-router-dom';

	const HashLink: React.ComponentType<LinkProps>;
	const NavHashLink: React.ComponentType<NavLinkProps>;

	export { HashLink, NavHashLink };
}
