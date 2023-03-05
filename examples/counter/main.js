import { makeStore } from '../../src/state';

const counter = makeStore(0);

const h2 = document.querySelector('h2');
const buttonIncrement = document.querySelector('#increment');
const buttonDecrement = document.querySelector('#decrement');
const buttonReset = document.querySelector('#reset');

counter.subscribe(() => {
    console.log(`Counter is now: ${counter.read()}`);
    h2.textContent = counter.read();
});

counter.subscribe(() => {
    document.title = counter.read();
});

const reset = () => 0;

function increment(state) {
    return state + 1;
}

function decrement(state) {
    return state - 1;
}

buttonIncrement.onclick = () => counter.dispatch(increment);
buttonDecrement.onclick = () => counter.dispatch(decrement);
buttonReset.onclick = () => counter.dispatch(reset);

// */
