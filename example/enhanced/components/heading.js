import { config } from '../../config.js';

export default function heading() {
    const h1 = document.querySelector('h1');
    h1.textContent = '';

    const attrs = () => ({
        classList: ['hello', 'world']
    });

    return {
        element: h1,
        attrs,
        text: document.title
    };
}
