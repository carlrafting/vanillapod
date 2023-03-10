import {
    createMountable,
    div,
    p as $p,
    h1,
    button as $button,
    render,
} from 'vanillapod/dom';
import { createSignal, createEffect } from 'vanillapod/state';

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

function ButtonWithSignals() {
    const [text, setText] = createSignal('Update Signal');
    // createEffect(() => alert(text()));
    return $button(
        {
            onClick(e) {
                setText('Hello Signals!');
                e.target.textContent = text(); // quick & dirty solution until i figure out something better
            },
        },
        text()
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
    div(
        { id: 'multiple-prop-defs' },
        'Merge Multiple Property Definitions',
        {
            style: 'background-color:green;',
        },
        { style: 'padding:.5rem' }
    ),
    MyComponent,
    [ComponentHasProps, { text: 'This component has props!' }],
    ButtonWithSignals,
    createMountable(
        document.getElementById('test'),
        { id: 'test-overridden' },
        'Enhanced'
    )
);

console.timeEnd('dom');
