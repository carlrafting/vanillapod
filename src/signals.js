import { store } from './ministore.js';

export function signal(value) {
    const s = store(value);
    return [s.read, s.dispatch, s.subscribe];
}
/* 
const [count, setCount, countEffect] = signal(0);

countEffect(() => console.log(count()));

setCount(() => count() + 1);
setCount(() => count() + 2);
setCount(() => count() + 11);
*/
