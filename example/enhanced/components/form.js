export default function form() {
    const title = () => ({
        element: 'input',
        attributes: {
            id: 'txt',
            type: 'text',
            value: 'hello' 
        }
    });

    const br = () => ({
        element: 'br'
    });

    const description = () => ({
        element: 'textarea',
        text: 'this is some text inside the textarea...',
        attributes: {
            id: 'desc'
        }
    });

    const saveButton = () => ({
        element: 'button',
        text: 'Save',
        attributes: {
            classList: ['button', 'button--save']
        },
        events: {
            click() {
                console.log('You clicked the save button');
            }
        }
    });

    return {
        element: 'form',
        attributes: {
            action: '/foo/bar',
            method: 'post'
        },
        children: [
            title,
            br,
            description,
            br,
            saveButton
        ]
    };
}
