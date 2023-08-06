import { html } from './html';

const root = document.querySelector('#app');

const heading = 'hello world!';
const text = 'foobar 123...';
const list = ['First', 'Second', 'Third'];
const script = `alert('WARNING: DANGER!')`;

const foo = html`<h1>${heading}</h1>
    <p>${text}</p>
    <ul>
        ${list.map((item) => `<li>${item}</li>\n`)}
    </ul>
    <p>Some more text...</p>`;

document.body.append(
    html`<script>
        ${script};
        console.log(script);
    </script>`
);
root.append(foo);
