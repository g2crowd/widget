// @format

import camelize from '../src/camelize';

test('allows adding strategies', () => {
  expect(camelize('camel_case')).toEqual('camelCase');
  expect(camelize('camel-case')).toEqual('camelCase');
  expect(camelize('camelCase')).toEqual('camelCase');
});
