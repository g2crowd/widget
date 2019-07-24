// @format

import queue from '../src/queue';

test('can add a function', () => {
  let q = queue();

  q.add(jest.fn());

  expect(q.size()).toEqual(1);
});

test('flush calls asynchronously', () => {
  let q = queue();
  let fn = jest.fn();
  q.add(fn);
  q.flush();

  return q.flush().then(() => {
    expect(fn.mock.calls.length).toEqual(1);
  });
});

test('flush will run fns added after initial call', () => {
  let q = queue();
  let fn = jest.fn();
  let fn2 = jest.fn();
  q.add(fn);
  q.flush();
  q.add(fn2);

  return q.flush().then(() => {
    expect(fn2.mock.calls.length).toEqual(1);
  });
});

test('flush will run again after delayed completion', (done) => {
  let q = queue();
  let fn = jest.fn();
  let fn2 = jest.fn();
  q.add(fn);

  q.flush().then(() => {
    q.add(fn2);
    q.flush().then(() => {
      expect(fn2.mock.calls.length).toEqual(1);
      done();
    });
  });
});
