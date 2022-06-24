import { test, expect } from 'vitest';
import setElementTextContent from '../src/text';

test('set element text', () => {
    const text = 'hello world';
    const element = document.createElement('p');
    setElementTextContent(element, { text });
    expect(element).toHaveTextContent(text);
});
