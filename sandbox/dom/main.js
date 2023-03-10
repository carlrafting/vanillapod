import {
    createElement,
    div,
    p as $p,
    h1,
    button as $button,
    render,
} from 'vanillapod/src/dom';
import { createSignal } from 'vanillapod/src/state';

console.time('dom');

const root = document.querySelector('#app');

const nested = createElement(
    'div',
    { className: 'hero' },
    createElement('h1', 'Hi Again!')
);
const p = createElement('p', 'Hello World!');
const list = createElement(
    'ul',
    createElement('li', 'One'),
    createElement('li', 'Two'),
    createElement('li', 'Three')
);
const elWithProps = createElement(
    'div',
    { className: 'red green yellow', id: 'el-with-props' },
    'An element with props!'
);
const textInput = createElement('input', {
    id: 'text-input',
    value: 'Write Something!',
    type: 'text',
});
const button = createElement(
    'button',
    {
        id: 'button',
        type: 'button',
        onClick: (event) => {
            alert('CLICKED!');
            console.log(event);
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

function ComponentWithSignals() {
    const [text, setText, createTextFx] = createSignal('');
    const id = 'signal-paragraph';
    createTextFx(() => console.log(text()));
    return $p(
        text(),
        { id },
        $button('Update Signal', {
            onClick() {
                setText('Hello Signals!');
            },
        })
    );
}

render(
    () => root,
    nested,
    p,
    list,
    elWithProps,
    textInput,
    button,
    div({ id: 'helper' }, 'Helper Method'),
    div({ id: 'foobar' }, '123'),
    MyComponent,
    [ComponentHasProps, { text: 'This component has props!' }],
    ComponentWithSignals,
    createElement(
        document.getElementById('test'),
        { id: 'test-overridden' },
        'Enhanced'
    )
);

console.timeEnd('dom');
