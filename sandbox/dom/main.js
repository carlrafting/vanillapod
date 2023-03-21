import {
    createMountable,
    div,
    p as $p,
    h1,
    button as $button,
    render,
} from 'vanillapod/dom';
import { createSignal } from 'vanillapod/state';
import debug from 'vanillapod/debug';

debug(true);

console.time('dom');

const root = document.querySelector('#app');

const nested = createMountable(
    'div',
    { className: 'hero' },
    createMountable('h1', 'Hi Again!')
);
const p = createMountable('p', 'Hello World!');
const list = createMountable(
    'ul',
    createMountable('li', 'One'),
    createMountable('li', 'Two'),
    createMountable('li', 'Three')
);
const elWithProps = createMountable(
    'div',
    { className: 'red green yellow', id: 'el-with-props' },
    'An element with props!'
);
const textInput = createMountable('input', {
    id: 'text-input',
    value: 'Write Something!',
    type: 'text',
});
const button = createMountable(
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
    /* let currentElement = null;
    createEffect(() => {
        currentElement.textContent = text();
    }); */
    return $button(
        {
            onClick({ target }) {
                setText('Hello Signals!');
                target.textContent = text();
            },
        },
        text()
    );
}

// we don't want this scenarion to be possible
// @url https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations
const danger = '<img src="x" onerror=alert("DANGER!")>';

/* const destroy = */ render(
    () => root,
    nested,
    p,
    list,
    elWithProps,
    textInput,
    button,
    div({ id: 'helper' }, 'Helper Method'),
    div({ id: 'foobar' }, '123'),
    div({ id: 'multiple-prop-defs' }, 'Merge Multiple Property Definitions', {
        style: 'background-color:green;padding:.5rem;color:#fff;',
    }),
    MyComponent,
    [ComponentHasProps, { text: 'This component has props!' }],
    ButtonWithSignals,
    createMountable(
        document.getElementById('test'),
        { id: 'test-overridden' },
        'Enhanced'
    ),
    null,
    div({ innerHTML: danger }, 'Setting innerHTML is not permitted')
);

// destroy();

console.timeEnd('dom');
