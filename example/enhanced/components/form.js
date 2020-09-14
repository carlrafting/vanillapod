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

    const createLabel = (text, htmlFor) => ({
        el: 'label',
        text,
        props: { htmlFor }
    });

    const [titleLabel, descLabel] = [
        { text: 'Title', htmlFor: 'txt' },
        { text: 'Description', htmlFor: 'desc'}
    ].map(label => 
        () => createLabel(label.text, label.htmlFor)
    );

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
        classList: ['button', 'button--save'],
        events: {
            click(e) {
                console.log('You clicked the save button');
                e.preventDefault();
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
            titleLabel,
            br,
            title,
            br,
            descLabel,
            br,
            description,
            br,            
            saveButton
        ]
    };
}
