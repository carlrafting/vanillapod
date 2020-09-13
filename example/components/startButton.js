import { config } from '../config.js';
import element from '../../src/elementHelper.js';

export default function startButton() {
    const attrs = () => ({
        classList: ['button', 'button--start']
    });

    const onClick = () => {
        console.log('You clicked the startbutton');
    };

    return element('button', config.startButtonText, attrs, { click: onClick });
}
