import assert from 'node:assert/strict';
import { PRODUCTS, getCategories } from '../js/products.mjs';

assert.equal(PRODUCTS.length, 6, 'The initial catalog must contain six products');
assert.deepEqual(getCategories(), ['Maquillaje', 'Cuidado capilar']);
assert.ok(PRODUCTS.every(({ name, price, category }) => name && price > 0 && category));

console.log('catalog.test.mjs: passed');
