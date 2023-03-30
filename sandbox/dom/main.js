import 'counter/styles.css';
import {
    createTemplate,
    div,
    p as $p,
    h1,
    h2,
    h3,
    ul,
    li,
    button as $button,
    render,
    text,
    fragment,
    comment,
} from 'vanillapod/dom';
import { createSignal, createEffect } from 'vanillapod/state';
import debug from 'vanillapod/debug';

debug(true);

console.time('dom');

const root = document.querySelector('#app');

const nested = createTemplate(
    'div',
    { className: 'hero' },
    createTemplate('h1', 'Hi Again!')
);
const p = createTemplate('p', 'Hello World!');
const list = createTemplate(
    'ul',
    createTemplate('li', 'One'),
    createTemplate('li', 'Two'),
    createTemplate('li', 'Three')
);
const elWithProps = createTemplate(
    'div',
    { className: 'red green yellow', id: 'el-with-props' },
    'An element with props!'
);
const textInput = createTemplate('input', {
    id: 'text-input',
    value: 'Write Something!',
    type: 'text',
});
const button = createTemplate(
    'button',
    {
        id: 'button',
        type: 'button',
        onClick: (event) => {
            alert('CLICKED!');
            event.preventDefault();
        },
    },
    'Save'
);

function MyComponent() {
    return div('This is a component!', {
        id: 'my-component',
        style: 'background-color:yellow;padding:1rem;',
    });
}

function ComponentHasProps({ text }) {
    return div(
        {
            id: 'component-with-props',
            style: 'background-color:red;padding:1rem;',
        },
        h1(text),
        $p('And a paragraph inside!')
    );
}

function ButtonWithSignals() {
    const [text, setText] = createSignal('Update Signal');
    return $button(
        {
            onClick() {
                setText('Hello Signals!');
            },
        },
        text(),
        (el) => {
            createEffect(() => {
                el.textContent = text();
            });
        }
    );
}

// we don't want this scenarion to be possible
// @url https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations
const danger = '<img src="x" onerror=alert("DANGER!")>';

/* const destroy = */ render(
    () => [
        nested,
        p,
        list,
        elWithProps,
        textInput,
        button,
        div({ id: 'helper' }, 'Helper Method'),
        div({ id: 'foobar' }, '123'),
        div(
            { id: 'multiple-prop-defs' },
            'Merge Multiple Property Definitions',
            {
                style: 'background-color:green;padding:.5rem;color:#fff;',
            }
        ),
        createTemplate(MyComponent),
        createTemplate([
            ComponentHasProps,
            { text: 'This component has props!' },
        ]),
        createTemplate(ButtonWithSignals),
        createTemplate(
            document.getElementById('test'),
            { id: 'test-overridden' },
            'Enhanced'
        ),
        null,
        div({ innerHTML: danger }, 'Setting innerHTML is not permitted'),
        createTemplate([
            function myComponent({ text }) {
                return h2(text);
            },
            { text: 'Hello World!' },
        ]),
        createTemplate(function myComponent({ text = 'hello again!' }) {
            return h3(text ? text.toLocaleUpperCase() : ':(');
        }),
        createTemplate(() =>
            $p(
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            )
        ),
        div(
            { style: 'border:1px dotted red;padding:1rem' },
            'Hello DIV!',
            (el) => {
                console.log({ el });
                // el.innerHTML = 'foobar!';
                el.addEventListener('click', () => alert('callback'));
            }
        ),
        createTemplate({
            props: {
                id: 'special',
                innerHTML: 'danger!!!',
            },
            on: {
                click() {
                    alert(`Don't you see i'm special!?`);
                },
            },
            attrs: {
                foo: 'bar',
            },
            classList: ['a', 'very', 'special', 'element'],
            el: 'div',
            text: `I'm Special!`,
            children: [ul(li('1'), li('2'), li('3'))],
        }),
        // eslint-disable-next-line quotes
        comment("I'm a comment"),
        // eslint-disable-next-line quotes
        text("I'm just a simple text node"),
        fragment(),
    ],
    root
);

// destroy();

console.timeEnd('dom');
