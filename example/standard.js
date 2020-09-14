import { config } from './config.js';

import bootstrap from './standard/bootstrap.js';
import setattr from './standard/attributes.js';
import settext from './standard/text.js';
import hooks from './standard/hooks.js';
import mutate from './standard/mutate.js';
import events from './standard/events.js';
import { setData, getData } from './standard/storage.js';

// data related code...
let tasks = [];
const tasksKey = 'tasks';

// bootstrap required elements
const elements = bootstrap();

// set attributes on elements
setattr(elements);

// set text for elements
settext(elements);

// hooks/lifecycle events
const hooksArray = hooks(elements);

// mutate
mutate(elements);

// element DOM events
events(elements);

// execute before hooks
console.log(hooksArray);

function mount() {
    // mount container to DOM
    root.appendChild(container);

    // execute mount hooks
    containerHooks.mount();
}

function unmount() {
    root.removeChild(container);

    // execute unmount hooks
    containerHooks.unmount();
}

function update() {
    if (tasks && tasks.length > 0) {
        containerHooks.update();
        formHooks.update();
        window.requestAnimationFrame(update);
    }
}

// window.addEventListener('blur', unmount);
window.addEventListener('focus', mount);
window.addEventListener('DOMContentLoaded', mount);
// window.requestAnimationFrame(update);
