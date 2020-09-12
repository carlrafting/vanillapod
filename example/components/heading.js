import { config } from '../config.js';
import element from '../../src/elementHelper.js';

export default function heading() {
    return element('h1', config.containerHeading);
}
