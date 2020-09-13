import { config } from '../config.js';

// root element
const root = document.getElementById('root');

// create required elements
const container = document.createElement('div');
const heading = document.createElement('h1');
const form = document.createElement('form');
const input = document.createElement('input');
const saveButton = document.createElement('button');

// hooks/lifecycle events
const containerHooks = {
    before() {
        console.log('before mount');
    },
    mount() {
        console.log('on mount');
    },
    unmount() {
        console.log('on unmount');
    }
};

// set attributes on elements
const { saveButtonClassList, containerClassList } = config;
container.classList.add(...containerClassList);
saveButton.classList.add(...saveButtonClassList);
form.method = 'post';
form.action = '/';
input.type = 'text';
input.autofocus = true;

// set text for elements
const { containerHeading, saveButtonText } = config;
heading.appendChild(document.createTextNode(containerHeading));
saveButton.appendChild(document.createTextNode(saveButtonText));

// append heading and buttons to container
form.appendChild(input);
form.appendChild(saveButton);
container.appendChild(heading);
container.appendChild(form);
// container.appendChild(displayTimer);
// container.appendChild(startButton);
// container.appendChild(stopButton);

// element DOM events
container.addEventListener('click', ({ target }) => {
    if (target.classList.contains('button--save')) {
        console.log('You clicked the save button!');
    } else {
        console.log('You clicked on something else...');
    }
}, false);

// execute before hooks
containerHooks.before();

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

// window.addEventListener('blur', unmount);
window.addEventListener('focus', mount);
window.addEventListener('DOMContentLoaded', mount);