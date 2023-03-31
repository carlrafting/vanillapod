import { createSignal, createEffect } from '../../src/state';
import { button, render, h2, fragment, createTemplate } from '../../src/dom';
import debug from '../../src/debug';
import 'modern-css-reset';
import './styles.css';

debug(true);

function Counter() {
    const [count, setCount] = createSignal(0);
    const increment = () => count() + 1;
    const double = () => count() * 2;
    const half = () => count() / 2;
    const decrement = () => count() - 1;

    return fragment(
        h2(count(), (el) => {
            createEffect(() => (el.textContent = count()));
        }),

        button(
            {
                onClick() {
                    setCount(increment);
                },
            },
            'Increment'
        ),

        button(
            {
                onClick() {
                    setCount(decrement);
                },
            },
            'Decrement'
        ),

        button(
            {
                onclick() {
                    setCount(double);
                },
            },
            'Double'
        ),

        button(
            {
                onclick() {
                    setCount(half);
                },
            },
            'Half'
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
