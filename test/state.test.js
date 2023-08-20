// import test from 'ava';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createReactive, signal, onChange } from '../src/state.js';

describe('reactivity', () => {
    it('should handle number values', () => {
        const number = createReactive(0);
        let effect = null;
        number.subscribe(() => {
            effect = true;
            assert.ok(effect);
        });
        number.dispatch(() => number.read() + 1);
        assert.strictEqual(number.read(), 1);
    });
    it('should handle booleans', () => {
        const boolean = createReactive(false);
        let effect = null;
        boolean.subscribe(() => {
            effect = true;
            assert.equal(effect, true);
        });
        boolean.dispatch(() => true);
        assert.equal(boolean.read(), true);
    });
    it('should handle string values', () => {
        const string = createReactive('');
        let effect = null;
        string.subscribe(() => {
            effect = true;
            assert.equal(effect, true);
        });
        string.dispatch(() => 'Hello World!');
        assert.equal(string.read(), 'Hello World!');
    });
    it('should handle null values', () => {
        const nullValue = createReactive(null);

        // object for testing subscribtion side-effects
        const effects = {
            nullValue: false,
        };

        nullValue.subscribe(() => {
            effects.nullValue = true;
            assert.equal(effects.nullValue, true);
        });
        nullValue.dispatch(() => ({ title: 'Hello World!' }));

        assert.notEqual(nullValue.read(), null);
    });
});

describe('signals', () => {
    it('should work as expected', () => {
        const [count, setCount /* , _countEffect */] = signal(0);

        // countEffect(() => console.log(count()));

        setCount(() => count() + 1);
        assert.equal(count(), 1);
        setCount(() => count() + 2);
        assert.equal(count(), 3);
        setCount(() => count() + 11);
        assert.equal(count(), 14);
    });
});

describe('store', () => {
    it('should store different kinds of values', () => {});
});

describe('onChange', () => {
    it('should work with arrays of primitive values', () => {
        {
            // array of numbers with same values
            const prev = [1, 2, 3];
            const current = [1, 2, 3];
            const results = onChange(prev, current);
            // console.log('same values:', results);
            assert.equal(results.added.length, 0, 'no added items');
            assert.equal(results.modified.length, 0, 'no modified items');
            assert.equal(results.removed.length, 0, 'no removed items');
        }
        {
            // array of numbers with added values
            const prev = [1, 2, 3];
            const current = [1, 2, 3, 4, 5, 6];
            const results = onChange(prev, current);
            // console.log('added value:', results);
            assert.equal(results.added.length, 3, 'added items');
        }
        {
            // array of numbers with removed values
            const prev = [1, 2, 3, 4, 5, 6];
            const current = [1, 2, 3];
            const results = onChange(prev, current);
            // console.log('removed value:', results);
            assert.equal(results.removed.length, 3, 'removed items');
        }
        {
            // array of numbers with updated values
            // console.log('updated values', onChange([1, 2, 3], [4, 5, 6]));
            const prev = [1, 2, 3];
            const current = [4, 5, 6];
            const results = onChange(prev, current);
            assert.equal(results.modified.length, 3, 'modified items');
        }
    });
    it('should work with arrays of objects', () => {
        {
            // array of objects with the same values
            console.log(
                'same object',
                onChange(
                    [{ value: 1 }, { value: 2 }, { value: 3 }],
                    [{ value: 1 }, { value: 2 }, { value: 3 }],
                ),
            );
            // array of objects with addition
            console.log(
                'added objects',
                onChange(
                    [{ value: 1 }, { value: 2 }, { value: 3 }],
                    [
                        { value: 1 },
                        { value: 2 },
                        { value: 3 },
                        { value: 4 },
                        { value: 5 },
                    ],
                ),
            );
            // array of objects with removals
            console.log(
                'removed objects',
                onChange(
                    [
                        { value: 1 },
                        { value: 2 },
                        { value: 3 },
                        { value: 4 },
                        { value: 5 },
                    ],
                    [{ value: 1 }, { value: 2 }, { value: 3 }],
                ),
            );
            // array of objects with modifications
            console.log(
                'updated objects',
                onChange(
                    [{ value: 1 }, { value: 2 }, { value: 3 }],
                    [{ value: 4 }, { value: 5 }, { value: 6 }],
                ),
            );
        }
    });
});
