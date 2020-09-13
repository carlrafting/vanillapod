export default function form() {
    const title = () => ({
        element: 'input',
        attributes: {
            id: 'txt',
            type: 'text',
            value: 'hello' 
        }
    });

    const description = () => ({
        element: 'textarea',
        text: 'this is some text inside the textarea...',
        attributes: {
            id: 'desc'
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
            description
        ]
    };
}
