import 'modern-css-reset';
import './app.css';
import {
    mount,
    createDocumentFragment,
    triggerHook,
    registerHooks,
    debug,
    h,
    createSignal,
} from '../../src/index.js';

debug(true);

function List({ tasks }) {
    return {
        element: 'ul',
        children: tasks.map((item, index) => ({
            element: 'li',
            children: [
                {
                    el: 'input',
                    props: { checked: item.completed, id: 'task-'.concat(index), type: 'checkbox' },
                },
                {
                    el: 'label',
                    props: { htmlFor: 'task-'.concat(index) },
                    text: item.value,
                },
            ],
        })),
    };
}

function Form({ tasks }) {
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

                triggerHook(window, 'error', {
                    message: 'Field can not be blank!',
                });
            },
        },
        children: [
            [
                List,
                {
                    tasks,
                },
            ],
            {
                el: 'label',
                props: { htmlFor: 'input-text' },
                text: 'Task Description',
            },
            { el: 'br' },
            { el: 'input', props: { id: 'input-text', type: 'text' } },
            { el: 'button', text: 'Add New Task' },
        ],
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
            {
                element: 'button',
                text: 'Clear All Tasks',
                on: { click: clearAll },
            },
            {
                element: 'button',
                text: 'Clear Completed Tasks',
                on: { click: clearCompleted },
            },
        ],
    });
}

function App({ data }) {
    const h1 = document.body.querySelector('h1');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || data;

    const updateList = (item, index) => ({
        element: 'li',
        children: [
            {
                el: 'input',
                attrs: { id: 'task-'.concat(index), type: 'checkbox' },
                props: { checked: item.completed },
            },
            {
                el: 'label',
                attrs: { for: 'task-'.concat(index) },
                text: item.value,
            },
        ],
    });

    const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));

    const count = () =>
        `${tasks.length} ${tasks.length > 1 ? 'tasks' : 'task'}`;

    const children = [
        [
            Header,
            {
                h1,
                count,
                tasks,
            },
        ],
        [
            Form,
            {
                tasks,
            },
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
                save();
            },
            clear(value) {
                if (value === 'all') {
                    tasks = [];
                    // updateUI();
                    save();
                }
                if (value === 'completed') {
                    tasks = tasks.filter((task) => !task.completed);
                    save();
                }
                setTimeout(() => location.reload(), 0);
            },
            error(error) {
                alert(error.message);
            },
        },
    });

    return {
        el,
        children,
    };
}

const root = document.querySelector('#app');

const [tasks] = createSignal([
    { value: 'first', completed: false },
    { value: 'second', completed: false },
    { value: 'third', completed: false },
]);

console.log(tasks());

mount(root, [
    App,
    {
        data: tasks(),
    },
]);
