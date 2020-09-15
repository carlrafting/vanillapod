/* global test, expect */

import setElementEventHandlers from '../src/events';
import userEvent from '@testing-library/user-event';

test('set one element event handler', () => {
    const onClick = jest.fn();
    const element = document.createElement('div');
    setElementEventHandlers(element, { events: { click: onClick }});
    userEvent.click(element);
    expect(onClick).toHaveBeenCalled();
});
