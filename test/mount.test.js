/* global test, expect */

import { mount } from '../dist/vanillapod';

test('should mount one component correctly', () => {
    function component() {
        return {
            element: 'div',
            text: 'Foo Bar'
        };
    }

    mount(null, component);

    // TODO: look into a more reliable way to test this?
    expect(document.body.firstChild.tagName).toBe('DIV');
    expect(document.body.firstChild).toHaveTextContent('Foo Bar');
});

test('should mount multiple components correctly', () => {
    function first() {
        return {
            el: 'div',
            props: {
                id: 'first'
            }
        };
    }

    function second() {
        return {
            el: 'div',
            props: {
                id: 'second'
            }
        };
    }

    const body = document.querySelector('body');

    mount(body, first, second);

    const firstElement = document.getElementById('first');
    const secondElement = document.getElementById('second');

    expect(body).toContainElement(firstElement);
    expect(body).toContainElement(secondElement);
});
