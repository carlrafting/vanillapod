import { createMetaElement, ensureMetaElementExists } from './hyper.js';

document.head.append(createMetaElement());

if (ensureMetaElementExists()) {
    alert('hooray!');
}
