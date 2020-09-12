import { doRegister } from './register.js';
import execute from './execute.js';
import attachChildren from './attachChildren.js';
import createElement from './createElement.js';

export function mount(root, element) {
    element = execute(
        element,
        doRegister,
        createElement,
        attachChildren
    );

    root.appendChild(element);
}