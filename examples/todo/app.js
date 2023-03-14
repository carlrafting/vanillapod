import 'modern-css-reset';
import './app.css';
import { createSignal } from '../../src/state';
import debug from '../../src/debug';
import {
    createMountable,
    form,
    input,
    label,
    li,
    render,
    ul,
    br,
    button,
    header,
    span,
} from '../../src/dom';

debug(true);

const [tasks, setTasks] = createSignal([
    { value: 'first', completed: false },
    { value: 'second', completed: true },
    { value: 'third', completed: false },
]);

const read = () => JSON.parse(localStorage.getItem('tasks'));
const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));

function Header() {
    const h1 = document.body.querySelector('h1');

    const clearCompleted = () => {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            console.log('clearCompleted');
        }
    };

    const clearAll = () => {
        if (confirm('Are you sure you want to clear ALL tasks?')) {
            console.log('clearAll');
        }
    };

    const count = () =>
        `${tasks().length} ${tasks().length > 1 ? 'tasks' : 'task'}`;

    return header(
        h1,
        span(count()),
        button({ onClick: clearAll }, 'Clear All Tasks'),
        button({ onClick: clearCompleted }, 'Clear Completed Tasks')
    );
}

function List() {
    return ul(
        ...tasks().map((item, index) => {
            console.log({ item });
            return li(
                input({
                    checked: item.completed,
                    id: `task-${index}`,
                    type: 'checkbox',
                }),
                label({ htmlFor: `task-${index}` }, item.value)
            );
        })
    );
}

function Form() {
    const onSubmit = (e) => {
        alert('form submitted!');
        e.preventDefault();
    };
    return form(
        { onSubmit },
        label({ htmlFor: 'input-text' }, 'Task Description'),
        br,
        input({ id: 'input-text', type: 'text' }),
        button('Add New Task')
    );
}

function App() {
    return createMountable(null, Header, List, Form);
}

const root = document.querySelector('#app');

render(root, App);
