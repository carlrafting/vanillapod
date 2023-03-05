import { test, expect, vi } from 'vitest';
import setElementEventHandlers from '../src/events';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/dom';

test('should set one element click handler', () => {
    const onClick = vi.fn();
    const element = document.createElement('div');
    setElementEventHandlers(element, { events: { click: onClick } });
    userEvent.click(element);
    expect(onClick).toHaveBeenCalled();
});

test('should correctly set one element click handler when event name is UPPERCASED', () => {
    const onClick = vi.fn();
    const element = document.createElement('div');
    setElementEventHandlers(element, { events: { CLICK: onClick } });
    userEvent.click(element);
    expect(onClick).toHaveBeenCalled();
});

test('should be able to use camelCase syntax for setting click handler', () => {
    const onClick = vi.fn();
    const element = document.createElement('div');
    setElementEventHandlers(element, { events: { onClick } });
    userEvent.click(element);
    expect(onClick).toHaveBeenCalled();
});

test('should able to set custom event', () => {
    const onShow = vi.fn();
    const event = new Event('show');
    const element = document.createElement('div');
    setElementEventHandlers(element, { events: { onShow } });
    fireEvent(element, event);
    // userEvent.click(element);
    expect(onShow).toHaveBeenCalled();
});
