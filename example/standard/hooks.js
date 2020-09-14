export default ({ elements }) => {
    const hooks = {};
    const {
        container,
        form
    } = elements;

    hooks.container = [
        container, {
            before() {
                console.log('container before mount');
                setData(tasksKey, tasks);
            },
            mount() {        
                console.log('container on mount');
                tasks = getData(tasksKey);
            },
            update() {
                console.log('container on update');
            },
            unmount() {
                console.log('container on unmount');
        
                tasks = [];
            }
        }
    ];
   
    hooks.form = [
        form, {
            update() {
                if (tasks && tasks.length > 0) {
                    let task;
                    for (let i = 0; i < tasks.length; i++) {
                        task = tasks[i];
                        const li = document.createElement('li');
                        li.appendChild(document.createTextNode(task));
                        taskList.appendChild(li);
                    }
        
                    tasks = [];
        
                    return;
                }
        
                console.log('No tasks to render');
            }
        }
    ];

    return hooks;
};
