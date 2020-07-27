import { createGenerateClassName, StylesProvider, ThemeProvider } from '@material-ui/styles';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CodeBlock } from '../Common/Components/CodeBlock';
import theme from '../Common/theme';

const registeredComponents = {
	CodeBlock
};

const generateClassName = createGenerateClassName({
	productionPrefix: 'dyn'
});

for (const elem of document.querySelectorAll<HTMLElement>('[data-dynamic-component]')) {
	const Component = registeredComponents[elem.dataset.dynamicComponent!];
	if (Component) {
		const props = JSON.parse(elem.dataset.componentProps ?? '{}');
		ReactDOM.render(
			(
				<StylesProvider generateClassName={generateClassName}>
					<ThemeProvider theme={theme}>
						<Component {...props}/>
					</ThemeProvider>
				</StylesProvider>
			),
			elem
		);
	}
}
