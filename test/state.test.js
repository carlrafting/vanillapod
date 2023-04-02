// import { test, assert.equal } from 'vitest';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, signal } from '../src/state.js';

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
        assert.equal(effects.number, true);
    });
    boolean.subscribe(() => {
        effects.boolean = true;
        assert.equal(effects.boolean, true);
    });
    string.subscribe(() => {
        effects.string = true;
        assert.equal(effects.string, true);
    });
    nullValue.subscribe(() => {
        effects.nullValue = true;
        assert.equal(effects.nullValue, true);
    });

    number.dispatch(() => number.read() + 1);
    boolean.dispatch(() => true);
    string.dispatch(() => 'Hello World!');
    nullValue.dispatch(() => ({ title: 'Hello World!' }));

    assert.equal(number.read(), 1);
    assert.equal(boolean.read(), true);
    assert.equal(string.read(), 'Hello World!');
    assert.notEqual(nullValue.read(), null);
});

test('signals: should work as expected', () => {
    const [count, setCount /* , _countEffect */] = signal(0);

    // countEffect(() => console.log(count()));

    setCount(() => count() + 1);
    assert.equal(count(), 1);
    setCount(() => count() + 2);
    assert.equal(count(), 3);
    setCount(() => count() + 11);
    assert.equal(count(), 14);
});
