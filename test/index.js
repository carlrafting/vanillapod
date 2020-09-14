import mount from '../src/mount.js';
import debug from '../src/debug.js';

debug(true);

const root = document.getElementById('root');

function component() {
    return {
        element: 'div',
        text: 'component',
        attrs: {
            'data-hello': 'world'
        }
    };
}

function secondComponent() {
    return {
        element: 'div',
        text: 'secondComponent',
        children: [
            thirdComponent
        ]
    };
}

function thirdComponent() {
    return {
        element: 'div',
        text: 'thirdComponent Nested inside secondComponent'
    };
}

function app() {
    return {
        element: 'div',
        classList: [
            'foo',
            'bar'
        ],
        children: [
            component,
            secondComponent
        ]
    };
}

mount(root, app);