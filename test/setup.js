// github issue on how to use jest-dom with vitest: https://github.com/testing-library/jest-dom/issues/439
import { expect } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);
