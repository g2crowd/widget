// @format

import initiationStrategies from '../src/initiationStrategies';

test('allows adding strategies', () => {
  let strategies = initiationStrategies();
  let mocked = jest.fn();

  strategies.add('testing', mocked);

  expect(strategies.get('testing')).toEqual(mocked);
});

test('allows seeding w/ strategies', () => {
  let mocked = jest.fn();
  let strats = initiationStrategies({ mocked: mocked });

  expect(strats.get('mocked')).toEqual(mocked);
});
