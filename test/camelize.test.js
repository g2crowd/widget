// @format

import camelize from '../src/camelize';
import { extractOptions } from '@g2crowd/extract-options';

test('allows adding strategies', () => {
  expect(extractOptions('camel', { camelOne: 1 })).toEqual({ one: 1 });
  expect(camelize('camel_case')).toEqual('camelCase');
  expect(camelize('camel-case')).toEqual('camelCase');
  expect(camelize('camelCase')).toEqual('camelCase');
});
