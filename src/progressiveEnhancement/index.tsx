import { createGenerateClassName, StylesProvider, ThemeProvider } from '@mui/styles';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CodeBlock } from '../common/components/CodeBlock';
import VersionMenu from '../common/components/VersionMenu';
import theme from '../common/theme';

const registeredComponents = {
	CodeBlock,
	VersionMenu
};

const generateClassName = createGenerateClassName({
	productionPrefix: 'dyn'
});

for (const elem of document.querySelectorAll<HTMLElement>('[data-dynamic-component]')) {
	const Component = registeredComponents[elem.dataset.dynamicComponent!] as React.ComponentType | undefined;
	if (Component) {
		const props = JSON.parse(elem.dataset.componentProps ?? '{}') as JSX.IntrinsicAttributes;
		ReactDOM.render(
			<StylesProvider generateClassName={generateClassName}>
				<ThemeProvider theme={theme}>
					<Component {...props} />
				</ThemeProvider>
			</StylesProvider>,
			elem
		);
	}
}
