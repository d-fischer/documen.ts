import { createGenerateClassName, StylesProvider, ThemeProvider } from '@mui/styles';
import { CodeBlock } from '../common/components/CodeBlock.js';
import VersionMenu from '../common/components/VersionMenu.js';
import theme from '../common/theme.js';
import { type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

const registeredComponents = {
	CodeBlock,
	VersionMenu
};

const generateClassName = createGenerateClassName({
	productionPrefix: 'dyn'
});

for (const elem of document.querySelectorAll<HTMLElement>('[data-dynamic-component]')) {
	const Component = registeredComponents[elem.dataset.dynamicComponent!] as ComponentType | undefined;
	if (Component) {
		const props = JSON.parse(elem.dataset.componentProps ?? '{}') as JSX.IntrinsicAttributes;
		const root = createRoot(elem);
		root.render(
			<StylesProvider generateClassName={generateClassName}>
				<ThemeProvider theme={theme}>
					<Component {...props} />
				</ThemeProvider>
			</StylesProvider>
		);
	}
}
