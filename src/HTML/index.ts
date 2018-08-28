import { registerLanguage } from 'react-syntax-highlighter/light';
import js from 'react-syntax-highlighter/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/languages/hljs/typescript';

registerLanguage('javascript', js);
registerLanguage('js', js);
registerLanguage('typescript', ts);
registerLanguage('ts', ts);

import renderReferencePage from '../Common/HTMLRenderer/HTMLRenderer';
export default renderReferencePage;
