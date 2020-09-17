/* global describe, test, expect */

import { registerElement } from '../dist/vanillapod';

describe('registerElement', () => {
    test('should return object', () => {
        function component() {
            return {
                el: 'div'
            };
        }
        const props = registerElement(component);
        expect(props.elementCreatorFunction).toEqual(component);
        expect(props.el).toBe(component().el);
        expect(props).toMatchObject(component());
    });
});
