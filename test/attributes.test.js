/*global test, expect, beforeEach*/

import { setElementAttributes } from '../dist/vanillapod';

let element;

beforeEach(() => {
    element = document.createElement('div');
});

test('set element data', () => {
    const data = {
        foo: 'bar'
    };
    setElementAttributes(element, { data });
    const result = element.dataset.foo;
    expect(result).toBe(data.foo);
});

test('set element classList', () => {
    const classList = [
        'foo',
        'bar'
    ];
    setElementAttributes(element, { classList });
    expect(element).toHaveClass(classList[0]);
    expect(element).toHaveClass(classList[1]);
});

test('set element attributes', () => {
    const attrs = () => ({
        data: {
            hello: 'world'
        },
        classList: ['foo', 'bar']
    });
    setElementAttributes(element, { attrs });
    expect(element).toHaveClass(attrs().classList[0]);
    expect(element).toHaveClass(attrs().classList[1]);
});
