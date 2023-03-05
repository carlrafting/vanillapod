import { describe, test, expect } from 'vitest';
import { createComponentInstance } from '../src/element';

describe('createComponentInstance', () => {
    test('should return object', () => {
        function component() {
            return {
                el: 'div',
            };
        }

        const props = createComponentInstance(component);
        expect(props.vanillapodComponent).toEqual(component);
        expect(props.el).toBe(component().el);
        expect(props).toMatchObject(component());
    });
});
