import { createSignal, createEffect } from '../../src/state';
import { button, render, h2, fragment } from '../../src/dom';
import debug from '../../src/debug';

debug(true);

function Counter({ id = 1 } = {}) {
    const [count, setCount] = createSignal(0);

    createEffect(() => {
        const countElem = document.getElementById(`count-${id}`);
        countElem.textContent = count();
    });

    return fragment(
        h2({ id: `count-${id}` }, `${count()}`),
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

render(document.body, Counter);
