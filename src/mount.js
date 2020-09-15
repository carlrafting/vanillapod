import bootstrap from '../src/bootstrap.js';

// mount to DOM
export default function mount(root, ...args) {
    args.forEach(arg => {
        const elementCreatorFunction = arg;
        const { element } = bootstrap(elementCreatorFunction);

        if (root) {
            root.appendChild(element);
            return;
        }

        const body = document.querySelector('body');
        body.appendChild(element);
    });
}
