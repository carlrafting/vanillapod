import { createSignal, createEffect } from '../../src/state';
import { button, render, h2, fragment, createTemplate } from '../../src/dom';
import debug from '../../src/debug';
import 'modern-css-reset';
import './styles.css';

debug(true);

function Counter() {
    const [count, setCount] = createSignal(0);

    return fragment(
        h2(count(), (el) => {
            createEffect(() => (el.textContent = count()));
        }),

        button(
            {
                onClick() {
                    setCount(count() + 1);
                },
            },
            'Increment'
        ),

        button(
            {
                onClick() {
                    setCount(count() - 1);
                },
            },
            'Decrement'
        ),

        button(
            {
                onClick() {
                    setCount(0);
                },
            },
            'Reset'
        )
    );
}

render(() => createTemplate(Counter), document.querySelector('#app'));
