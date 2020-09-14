import {config} from '../config.js';

export default ({ elements }) => {
    console.log(elements);

    const { saveButtonClassList, containerClassList, tasksListClassList } = config;
    const {
        container,
        saveButton,
        taskList,
        form,
        input
    } = elements;

    container.classList.add(...containerClassList);
    saveButton.classList.add(...saveButtonClassList);
    taskList.classList.add(...tasksListClassList);
    form.method = 'post';
    form.action = '/';
    input.type = 'text';
    input.autofocus = true;
};