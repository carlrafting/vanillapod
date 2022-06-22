import { describe, test, expect } from 'vitest';
import { registerElement } from '../src/element';

describe('registerElement', () => {
    test('should return object', () => {
        function component() {
            return {
                el: 'div'
            };
        }
        
        const props = registerElement(component);
        expect(props.vanillapodComponent).toEqual(component);
        expect(props.el).toBe(component().el);
        expect(props).toMatchObject(component());
    });
});
