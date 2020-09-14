export default ({ elements }) =>  {
    const {
        container,
        form
    } = elements;

    container.addEventListener('click', ({ target }) => {
        if (target.classList.contains('button--save')) {
            console.log('You clicked the save button!');
        } else {
            console.log('You clicked on something else...');
        }
    }, false);
    //*/
    
    form.addEventListener('submit', (e) => {
        if (input.value !== '') {
            tasks.push(input.value);
            input.value = '';
            setData(tasksKey, tasks);
            update();
        }
    
        e.preventDefault();
    }, false);
}