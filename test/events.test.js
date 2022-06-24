import { test, expect, vi } from 'vitest';
import setElementEventHandlers from '../src/events';
import userEvent from '@testing-library/user-event';

test('set one element event handler', () => {
    const onClick = vi.fn();
    const element = document.createElement('div');
    setElementEventHandlers(element, { events: { click: onClick }});
    userEvent.click(element);
    expect(onClick).toHaveBeenCalled();
});
