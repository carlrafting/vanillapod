export default function taskList() {
    const tasks = [
        'first',
        'second',
        'third'
    ];

    const li = (text) => ({
        element: 'li',
        text
    });

    const taskItems = tasks.map(task => 
        () => li(task)
    );

    return {
        element: 'ul',
        classList: ['tasks'],
        children: taskItems
    };
}
