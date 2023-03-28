import 'modern-css-reset';
import './global.css';
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
    createTemplate,
} from '../../src/dom';
import { diff } from '../../sandbox/signalsdom/src/core.js';
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
        tasks() !== null &&
        `${tasks().length} ${tasks().length > 1 ? 'tasks' : 'task'}`;

    return header(
        h1,
        span(count(), (el) => {
            createEffect(() => {
                el.textContent = count();
            });
        }),
        button({ onClick: clearAll }, 'Clear All Tasks'),
        button({ onClick: clearCompleted }, 'Clear Completed Tasks')
    );
}

function List() {
    const onChange = (e) => {
        // console.log('HELLO!');
        const label = e.target.labels[0];
        const task = tasks().find((item) => item.value == label.textContent);
        if (e.target.checked !== task.completed) {
            task.completed = e.target.checked;
            setTasks([...tasks()]);
        }
        e.preventDefault();
    };

    return ul({ id: 'tasks' }, (el) => {
        createEffect((prevState, currentState) => {
            if (prevState && currentState) {
                console.log({ prevState, currentState });
                const results = diff(prevState, currentState);
                console.log('diff', { results });
                if (prevState.length === currentState.length) {
                }
                /* if (prevState.length < currentState.length) {
                } */
                return;
            }

            tasks().map((item, index) => {
                el.append(
                    li(
                        input({
                            checked: item.completed,
                            id: `task-${index}`,
                            type: 'checkbox',
                            onChange,
                        }),
                        label({ htmlFor: `task-${index}` }, item.value)
                    )
                );
            });
        });
    });
}

function Form() {
    const [text, setText] = createSignal('');
    const [error, setError] = createSignal(null);

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
        createTemplate(List),
        label(
            {
                htmlFor: 'input-text',
            },
            'Task Description'
        ),
        br(),
        input(
            { id: 'input-text', type: 'text', onChange: handleTextChange },
            text(),
            (el) => {
                createEffect(() => (el.value = text()));
            }
        ),
        button('Add New Task')
    );
}

const App = fragment(createTemplate(Header), createTemplate(Form));

const root = document.querySelector('#app');

render(() => [App], root);
