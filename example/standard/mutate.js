export default ({ elements }) => {
    const {
        form,
        container,
        input,
        saveButton,
        heading,
        taskList
    } = elements;

    form.appendChild(input);
    form.appendChild(saveButton);
    container.appendChild(heading);
    container.appendChild(taskList);
    container.appendChild(form);
};