// @format

import { initiationStrategies } from '../src/initiationStrategies';

test('allows adding strategies', () => {
  let strats = initiationStrategies();
  let mocked = jest.fn();

  strats.add('testing', mocked);

  expect(strats.get('testing')).toEqual(mocked);
});

test('allows seeding w/ strategies', () => {
  let mocked = jest.fn();
  let strats = initiationStrategies({ mocked: mocked });

  expect(strats.get('mocked')).toEqual(mocked);
});
