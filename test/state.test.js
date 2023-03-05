import { test, expect } from 'vitest';
import { createStore, signal } from '../src/state';

test('store: should handle number, boolean, string and null values', () => {
    const number = createStore(0);
    const boolean = createStore(false);
    const string = createStore('');
    const nullValue = createStore(null);

    // object for testing subscribtion side-effects
    const effects = {
        number: false,
        boolean: false,
        string: false,
        nullValue: false,
    };

    number.subscribe(() => {
        effects.number = true;
        expect(effects.number).toBe(true);
    });
    boolean.subscribe(() => {
        effects.boolean = true;
        expect(effects.boolean).toBe(true);
    });
    string.subscribe(() => {
        effects.string = true;
        expect(effects.string).toBe(true);
    });
    nullValue.subscribe(() => {
        effects.nullValue = true;
        expect(effects.nullValue).toBe(true);
    });

    number.dispatch(() => number.read() + 1);
    boolean.dispatch(() => true);
    string.dispatch(() => 'Hello World!');
    nullValue.dispatch(() => ({ title: 'Hello World!' }));

    expect(number.read()).toBe(1);
    expect(boolean.read()).toBe(true);
    expect(string.read()).toBe('Hello World!');
    expect(nullValue.read()).not.toBeNull();
});

test('signals: should work as expected', () => {
    const [count, setCount /* , _countEffect */] = signal(0);

    // countEffect(() => console.log(count()));

    setCount(() => count() + 1);
    expect(count()).toBe(1);
    setCount(() => count() + 2);
    expect(count()).toBe(3);
    setCount(() => count() + 11);
    expect(count()).toBe(14);
});
