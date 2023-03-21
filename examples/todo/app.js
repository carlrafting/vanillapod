import 'modern-css-reset';
import './app.css';
import { createSignal, createEffect } from '../../src/state';
import debug from '../../src/debug';
import {
    div,
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
    fragment,
} from '../../src/dom';
import { createLocalStorage, createArray } from '../../src/utils';

debug(true);

const initialTasks = [
    { value: 'first', completed: false },
    { value: 'second', completed: true },
    { value: 'third', completed: false },
];
const db = createLocalStorage('tasks', initialTasks);
const [tasks, setTasks] = createSignal(db.read());

createEffect(() => {
    /* console.log('tasks', tasks()); */
    db.write(tasks());
});

function Header() {
    const h1 = document.body.querySelector('h1');

    const clearCompleted = () => {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            setTasks(() => tasks().filter((task) => !task.completed));
        }
    };

    const clearAll = () => {
        if (confirm('Are you sure you want to clear ALL tasks?')) {
            setTasks(null);
        }
    };

    const count = () =>
        `${tasks().length} ${tasks().length > 1 ? 'tasks' : 'task'}`;

    createEffect(() => {
        const el = document.querySelector('header > span');
        el.textContent = count();
    });

    return header(
        h1,
        span(count()),
        button({ onClick: clearAll }, 'Clear All Tasks'),
        button({ onClick: clearCompleted }, 'Clear Completed Tasks')
    );
}

function List() {
    const onChange = (e) => {
        // console.log('HELLO!');
        const label = e.target.labels[0];
        const task = tasks().find((item) => item.value == label.textContent);
        // return console.log({ tasks: _tasks, task });
        if (task) {
            task.completed = e.target.checked;
            setTasks(() => {
                return [
                    ...tasks().filter(
                        (item) => item.value !== label.textContent
                    ),
                ];
            });
        }
        e.preventDefault();
    };

    createEffect(() => {
        const el = document.getElementById('tasks');
        const items = createArray(...tasks());
        // console.log({ last: items.last() });
        if (el) {
            const index = tasks().length;
            console.log({ el }, tasks());
            render(
                el,
                li(
                    input({
                        checked: false,
                        id: `task-${index}`,
                        type: 'checkbox',
                        onChange,
                    }),
                    label({ htmlFor: `task-${index}` }, items.last().value)
                )
            );
        }
    });

    return ul(
        { id: 'tasks' },
        ...tasks().map((item, index) => {
            return li(
                input({
                    checked: item.completed,
                    id: `task-${index}`,
                    type: 'checkbox',
                    onChange,
                }),
                label({ htmlFor: `task-${index}` }, item.value)
            );
        })
    );
}

function Form() {
    const [text, setText] = createSignal('');
    const [error, setError] = createSignal(null);

    createEffect(() => {
        const el = document.getElementById('input-text');
        if (text() !== '') {
            el.value = '';
        }
    });

    createEffect(() => {
        if (error() !== null) {
            alert(error());
        }
    });

    const onSubmit = (e) => {
        /* console.log({ e }); */
        if (text() === '') {
            setError(() => {
                return 'Task Description can not be blank!';
            });
        }
        if (text() !== '') {
            setTasks(() => [...tasks(), { value: text(), completed: false }]);
            setText('');
        }
        e.preventDefault();
    };

    const handleTextChange = (e) => setText(e.target.value);

    return form(
        {
            onSubmit,
            onChange(event) {
                console.log(event.target);
            },
        },
        List,
        label(
            {
                htmlFor: 'input-text',
            },
            'Task Description'
        ),
        br,
        input(
            { id: 'input-text', type: 'text', onChange: handleTextChange },
            text()
        ),
        button('Add New Task')
    );
}

function App() {
    return fragment({}, Header, Form);
}

const root = document.querySelector('#app');

render(root, App);
