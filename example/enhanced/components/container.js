// cevjs
import element from '../../src/elementHelper.js';

// components
import heading from './heading.js';
import displayTimer from './displayTimer.js';
import startButton from './startButton.js';
import stopButton from './stopButton.js';
import form from './form.js';

export default function container() {
    const children = [
        heading,
        displayTimer,
        startButton,
        stopButton,
        form
    ];

    const attrs = () => ({
        classList: ['container', 'flow'],
        data: {
            hello: 'world',
            foo: ['bar', 'hello', 'world']
        }
    });

    const onClick = ({ target }) => {
        if (
            target.classList.contains(
                stopButton().classList[1]
            )
        ) {
            console.log('You clicked the stop button!');
        } else {
            console.log('You clicked on something else...');
        }
    };

    return element('div', null, attrs, { click: onClick }, children);
}
