declare module 'react-router-hash-link' {
	import {Link, NavLink} from 'react-router-dom';

	class HashLink extends Link {}
	class NavHashLink extends NavLink {}

	export { HashLink, NavHashLink };
}
