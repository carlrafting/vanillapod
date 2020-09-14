import { config } from '../../config.js';

export default function heading() {
    const h1 = document.querySelector('h1');
    h1.textContent = '';

    return {
        element: h1,
        text: document.title
    };
}
