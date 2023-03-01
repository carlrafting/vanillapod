import 'modern-css-reset';
import './app.css';
import { mount, /* unmount, */ createDocumentFragment, triggerHook, registerHooks, debug, h } from '../../src/index.js';

debug(true);

function List({ tasks, /* updateList */ }) {
    return {
        element: 'ul',
        children: tasks.map((item, index) => ({
            element: 'li',
            children: [
                { el: 'input', attrs: { id: 'task-'.concat(index), type: 'checkbox' }, props: { checked: item.completed } },
                { el: 'label', attrs: { for: 'task-'.concat(index) }, text: item.value }
            ]
        }))
    };
}

function Form({ tasks, /* updateList */ }) {
    return {
        element: 'form',
        on: {
            change({ target }) {
                if (target.type === 'checkbox') {
                    triggerHook(window, 'change', target);
                }
            },
            submit(event) {
                const input = document.querySelector('#input-text');
                event.preventDefault();

                if (input.value && input.value !== '') {
                    tasks.push({ value: input.value, completed: false });
                    triggerHook(window, 'update', { value: input.value });
                    input.value = '';
                    return;
                }

                triggerHook(window, 'error', { message: 'Field can not be blank!' });
            }
        },
        children: [
            [
                List,
                {
                    tasks,
                    // updateList
                }
            ],
            { el: 'label', attrs: { for: 'input-text' }, text: 'Task Description' },
            { el: 'br' },
            { el: 'input', attrs: { id: 'input-text', type: 'text' } },
            { el: 'button', text: 'Add New Task' }
        ]
    };
}

function Header({ h1, count }) {
    const clearCompleted = () => {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            triggerHook(window, 'clear', 'completed');
        }
    };
    const clearAll = () => {
        if (confirm('Are you sure you want to clear ALL tasks?')) {
            triggerHook(window, 'clear', 'all');
        }
    };

    return h('header', {
        children: [
            () => ({ element: h1 }),
            { element: 'span', text: count() },
            { element: 'button', text: 'Clear All Tasks', on: { click: clearAll } },
            { element: 'button', text: 'Clear Completed Tasks', on: { click: clearCompleted } }
        ],
    });
}

function App({ data }) {
    const h1 = document.body.querySelector('h1');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || data;

    const updateList = (item, index) => ({
        element: 'li',
        children: [
            { el: 'input', attrs: { id: 'task-'.concat(index), type: 'checkbox' }, props: { checked: item.completed } },
            { el: 'label', attrs: { for: 'task-'.concat(index) }, text: item.value }
        ]
    });

    const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));

    const count = () => `${tasks.length} ${tasks.length > 1 ? 'tasks' : 'task'}`;

    function updateUI(value) {
        const form = document.querySelector('form');
        const ul = form.querySelector('ul');
        const span = document.querySelector('header span');
        span.textContent = count();
        if (value) {
            mount(ul,
                updateList({ value, completed: false }, ul.children.length)
            );
        }
    }

    const children = [
        [
            Header,
            { h1, count, tasks }
        ],
        [
            Form,
            {
                tasks,
                updateList
            }
        ],
    ];

    const [el] = createDocumentFragment();

    registerHooks(window, {
        hooks: {
            change(target) {
                const task = tasks.find((item) => {
                    const label = target.labels[0];
                    return item.value === label.textContent;
                });

                if (task) {
                    task.completed = target.checked;
                    save();
                }
            },
            update(data) {
                const { value } = data;
                updateUI(value);
                save();
            },
            clear(value) {
                if (value === 'all') {
                    tasks = [];
                    // updateUI();
                    save();
                }
                if (value === 'completed') {
                    tasks = tasks.filter(task => !task.completed);
                    save();
                }
                setTimeout(() => location.reload(), 0);
            },
            error(error) {
                alert(error.message);
            }
        }
    });

    return {
        el,
        children
    };
}

const root = document.querySelector('#app');

mount(
    root,
    [
        App, {
            data: [
                { value: 'first', completed: false },
                { value: 'second', completed: false },
                { value: 'third', completed: false }
            ]
        }
    ],
);
