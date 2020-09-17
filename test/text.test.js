/* global test, expect */

import { setElementTextContent } from '../dist/vanillapod';

test('set element text', () => {
    const text = 'hello world';
    const element = document.createElement('p');
    setElementTextContent(element, { text });
    expect(element).toHaveTextContent(text);
});
