import { test, expect } from 'vitest';
import mount from '../src/mount';
import { elementHelper } from '../src/element';

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

    mount(document.body, first, second);

    const firstElement = document.getElementById('first');
    const secondElement = document.getElementById('second');

    expect(document.body).toContainElement(firstElement);
    expect(document.body).toContainElement(secondElement);
});

test('should be able to mount explicit component correctly', () => {
    function explicit() {
        const el = elementHelper({
            element: 'h1',
            text: 'Hello World!'
        });

        return {
            el
        };
    }

    mount(document.body, explicit);

    const el = document.querySelector('h1');

    expect(document.body).toContainElement(el);
    expect(el).toHaveTextContent('Hello World!');
    expect(el.nodeName).toEqual('H1');
});

test('should be able to pass props to component when mounting', () => {
    function h1({ message }) {
        return {
            el: 'h1',
            text: message
        };
    }

    mount(
        document.body,
        [
            h1, 
            { message: 'Hello World!' }
        ]
    );

    const el = document.querySelector('h1'); 
    expect(el).toHaveTextContent('Hello World!');
});
