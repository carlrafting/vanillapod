import { test, expect, /* beforeEach, */ } from 'vitest';
import { getByText } from '@testing-library/dom';
import mount from '../src/mount';
// import { debug } from '../src';
import { createElement } from '../src/element';

// beforeEach(() => (document.body.innerHTML = ''));

test('should mount one component correctly', () => {
    function component() {
        return {
            element: 'div',
            text: 'Foo Bar',
        };
    }

    mount(null, component);

    // TODO: look into a more reliable way to test this?
    expect(document.body.firstChild).toMatchSnapshot();
    expect(document.body.firstChild.tagName).toBe('DIV');
    expect(document.body.firstChild).toHaveTextContent('Foo Bar');
});

test('should mount multiple components correctly', () => {
    // debug(true);

    function first() {
        return {
            el: 'div',
            props: {
                id: 'first',
            },
        };
    }

    function second() {
        return {
            el: 'div',
            props: {
                id: 'second',
            },
        };
    }

    mount(document.body, first, second);

    const firstElement = document.getElementById('first');
    const secondElement = document.getElementById('second');

    expect(document.body).toContainElement(firstElement);
    expect(document.body).toContainElement(secondElement);
});

test('should be able to mount explicit component correctly', () => {
    const text = 'Foo Bar Hello World!';

    function explicit() {
        const props = createElement('h1', {
            element: 'h1',
            text,
        });

        return {
            ...props,
        };
    }

    mount(document.body, explicit);

    const el = getByText(document.body, text);

    expect(document.body).toContainElement(el);
    expect(el).toHaveTextContent(text);
    expect(el.nodeName).toEqual('H1');
});

test('should be able to pass props to component when mounting', () => {
    function h1({ message }) {
        return {
            el: 'h1',
            text: message,
        };
    }

    mount(document.body, [h1, { message: 'Hello World!' }]);

    const el = getByText(document.body, 'Hello World!');
    expect(el).toHaveTextContent('Hello World!');
});

test('shoud be able to mount objects matching vanillapod props', () => {
    // console.log(document.body.children);
    const component = { el: 'h1', text: 'Lorem Ipsum!' };
    mount(document.body, component);
    expect(document.body.children).toMatchSnapshot();
    expect(getByText(document.body, component.text)).toHaveTextContent(
        component.text
    );
});

test('shoud be able to mount any kind of node', () => {
    const comment = document.createComment('comment!');
    const fragment = document.createDocumentFragment();
    const text = document.createTextNode('text!');
    mount(document.body, comment, fragment, text);
    expect(document.body).toMatchSnapshot();
});
