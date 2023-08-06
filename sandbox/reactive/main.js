import { subscribe, createSignal } from "./reactive";

const [counter, setCounter] = createSignal(0);

const button = document.getElementById('count');
const output = document.getElementById('output');

console.log(button);

button.onclick = () => setCounter(counter + 1);

// subscribe to the state to receive updates
subscribe(value => output.textContent = value);

// update the state and notify subscribers again
setCounter(counter + 2);
// output: 3
