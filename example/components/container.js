import heading from './heading.js';
import displayTimer from './displayTimer.js';
import startButton from './startButton.js';
import stopButton from './stopButton.js';
import element from '../../src/elementHelper.js';

export default function container() {
    const children = [
        heading,
        displayTimer,
        startButton,
        stopButton
    ];

    const attrs = () => ({
        classList: ['container', 'flow'],
        data: {
            hello: 'world'
        }
    })

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
    }

    return element('div', null, attrs, { click: onClick }, children);
}
