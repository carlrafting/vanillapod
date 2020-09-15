// vanillapod
import { helper } from '../../../src/element.js';

// components
import heading from './heading.js';
import taskList from './taskList.js';
import form from './form.js';

export default function container() {
    const containerEl = document.querySelector('.container');
    
    const children = [
        heading,
        taskList,
        form
    ];

    const attrs = () => ({
        classList: ['container', 'flow'],
        data: {
            hello: 'world',
            foo: ['bar', 'hello', 'world']
        }
    });
    
    return {
        element: containerEl,
        attributes: attrs,
        children
    };
}
