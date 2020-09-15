/*global test, expect, beforeEach*/

import setElmentAttributes from '../src/attributes';

let element;

beforeEach(() => {
    element = document.createElement('div');
});

test('set element data', () => {
    const data = {
        foo: 'bar'
    };
    setElmentAttributes(element, { data });
    const result = element.dataset.foo;
    expect(result).toBe(data.foo);
});

test('set element classList', () => {
    const classList = [
        'foo',
        'bar'
    ];
    setElmentAttributes(element, { classList });
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
    setElmentAttributes(element, { attrs });
    expect(element).toHaveClass(attrs().classList[0]);
    expect(element).toHaveClass(attrs().classList[1]);
});
