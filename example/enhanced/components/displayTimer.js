import { config } from '../config.js';
import element from '../../src/elementHelper.js';

export default function displayTimer() {
    const attrs = () => ({
        classList: ['display-timer']
    });

    return element('div', config.timerOutput, attrs);
}
