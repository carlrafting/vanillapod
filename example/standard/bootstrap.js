export default () => {
    // root element
    const root = document.getElementById('root');

    // create required elements
    const container = document.createElement('div');
    const heading = document.createElement('h1');
    const form = document.createElement('form');
    const taskList = document.createElement('ul');
    const input = document.createElement('input');
    const saveButton = document.createElement('button');

    return {
        elements: {
            root,
            container,
            heading,
            form,
            taskList,
            input,
            saveButton,
        }
    };
};