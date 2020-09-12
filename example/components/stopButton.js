import { config } from '../config.js';
import element from '../../src/elementHelper.js';

export default function stopButton() {
    function attrs() {
        return {
            classList: ['button', 'button--stop']
        };
    }
    return element('button', config.stopButtonText, attrs);
}
