import * as vanillapod from '../../../vanillapod.js';
import { checkType, debounceRAF } from '../../../src/utils.js';

const helloWorldComponent = () => ({
    element: 'div',
    text: 'helloWorld component',
    on: {
        click() {
            console.log('app click handler fired!');
        }
    },
    hooks: {
        before() {
            console.log('helloWorld before hook');
        },
        mount() {
            console.log('helloWorld mount hook');
        }
    },
    children: [
        () => ({
            element: 'div',
            text: 'helloWorld component child',
            hooks: {
                before() {
                    console.log('helloWorld child component before hook');
                }
            }
        })
    ]
});

const buttonComponent = () => {
    return () => ({
        element: 'button',
        text: 'Unmount app',
        on: {
            click() {
                vanillapod.unmount(root, app);
            }
        },
        hooks: {
            before() {
                console.log('button before hook');
            },
            mount() {
                console.log('button mount hook');
            }
        }
    });
};

const button = buttonComponent();

function appComponent() {
    const props = {
        props: {
            id: 'app'
        },
        hooks: {
            mount() {
                console.log('mounted app');
            },
            before() {
                console.log('app before hook');
            },
            unmount() {
                console.log('unmounted app');
            }
        },
        on: {
            click() {
                console.log('This is the app click handler attacthed to the window object');
                vanillapod.unmount(app, button);
            }
        }
    };

    const children = [
        helloWorldComponent,
        button
    ];

    const [ element ] = vanillapod.createDocumentFragment(props);
    vanillapod.setElementEventHandlers(window, props);
    vanillapod.setElementChildren(element, { children });
    vanillapod.registerHooks(element, props);

    return () => ({
        element
    });
}

// vanillapod.debug(true);

const app = appComponent();

console.log(app);

const root = document.querySelector('#root');
const appMount = debounceRAF((...args) => {
    vanillapod.mount(root, app, ...args);
});

function firstComponent({ text }) {
    return {
        el: 'div',
        text,
        props: {
            id: 'first'
        },
        hooks: {
            before() {
                console.log('first before hook');
            },
            mount() {
                console.log('first mount hook');
            }
        }
    };
}

function secondComponent({ text }) {
    return {
        el: 'div',
        text,
        properties: {
            id: 'second'
        },
        hooks: {
            before() {
                console.log('second before hook');
            },
            mount() {
                console.log('second mount hook');
            }
        }
    };
}

appMount(
    [firstComponent, { text: 'first' }], 
    [secondComponent, { text: 'second' }]
);

window.checkType = checkType;


