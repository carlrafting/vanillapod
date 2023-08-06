import { createError } from 'vanillapod/error';
import { checkType } from 'vanillapod/utils';

export function html(strings, ...args) {
    console.log(strings, args);
    const template = document.createElement('template');
    if (template.content === undefined || 'content' in template === false) {
        createError('template element not supported!');
    }
    let results = '';
    let currentString;
    let currentArg;
    for (let i = 0; i < strings.length; i += 1) {
        currentString = strings[i];
        currentArg = args[i];
        if (currentString) {
            results += currentString;
            currentString = undefined;
        }
        if (currentArg) {
            if (checkType(currentArg) === 'array') {
                for (const item of currentArg) {
                    results += item;
                }
                continue;
            }
            results += currentArg;
            currentArg = undefined;
        }
    }
    console.log('results', results);
    template.innerHTML = results;
    console.log('fragment', template);
    return template.content.cloneNode(true);
}
