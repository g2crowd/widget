import widget from '../src/index';

describe('with attr=ue and data=ue-widget', () => {
  let register, one, two;

  function trigger(element, event) {
    const evt = new Event(event, { bubbles: true, cancelable: true });
    element.dispatchEvent(evt);
  }

  beforeEach(() => {
    document.body.innerHTML = `
    <div id='one' ue='widget-one' data-widget-one-options='{ "x": 1 }'></div>
    <div id='two' data-ue-widget='widget-two' data-widget-two-z='z' data-widget-two-y-value=2></div>
    `;
    register = widget({ attr: 'ue', data: 'ue-widget' }, 'page-refreshed', 'page-refreshed');
    one = jest.fn(() => {});
    two = jest.fn(() => {});

    register(
      'widget-one',
      function (opts, ready) {
        one(this, opts, ready);
        ready();
      },
      { init: 'immediate', defaults: { d: 'd' } }
    );
    register(
      'widget-two',
      function (opts, ready) {
        two(this, opts, ready);
        ready();
      },
      { init: 'immediate', defaults: { e: 'e' } }
    );

    register.initAllWidgets();
  });

  test('it calls widget-one with options', (done) => {
    setTimeout(() => {
      done();
      expect(one.mock.calls[0][0]).toEqual(document.getElementById('one'));
      expect(one.mock.calls[0][1]).toEqual({ x: 1, d: 'd' });
      expect(one.mock.calls[0][2]).toBeInstanceOf(Function);
    }, 50);
  });

  test('it calls widget-two with options', (done) => {
    setTimeout(() => {
      done();
      expect(two.mock.calls[0][0]).toEqual(document.getElementById('two'));
      expect(two.mock.calls[0][1]).toEqual({ yValue: 2, z: 'z', e: 'e' });
      expect(two.mock.calls[0][2]).toBeInstanceOf(Function);
    }, 50);
  });

  test('marks the datasets as completed', (done) => {
    setTimeout(() => {
      done();
      expect(document.getElementById('one').dataset.vvidget_widgetOne).toBe('true');
      expect(document.getElementById('two').dataset.vvidget_widgetTwo).toBe('true');
    }, 50);
  });

  describe('when double-registering a widget', () => {
    test('throws an error', () => {
      expect(() => {
        register('widget-one', () => {}, { init: 'immediate' });
      }).toThrow('widget-one has already been registered.');
    });
  });

  describe('when two widgets are on the same element', () => {
    beforeEach(() => {
      document.body.insertAdjacentHTML(
        'beforeend',
        `<div id='three' ue='widget-one widget-two' data-widget-one-x=1></div>`
      );
    });

    test('does not mark the new widget', (done) => {
      setTimeout(() => {
        done();
        expect(document.getElementById('three').dataset.vvidget_widgetOne).toBe(undefined);
      }, 50);
    });

    describe('when page refresh is triggered', () => {
      test('initializes both plugins', (done) => {
        trigger(document, 'page-refreshed');

        setTimeout(() => {
          done();
          expect(document.getElementById('three').dataset.vvidget_widgetOne).toBe('true');
          expect(document.getElementById('three').dataset.vvidget_widgetTwo).toBe('true');
        }, 50);
      });
    });
  });

  describe('when unregisted widget is appended', () => {
    beforeEach(() => {
      document.body.insertAdjacentHTML('beforeend', `<div id='three' ue='widget-three'></div>`);
      trigger(document, 'page-refreshed');
    });

    test('does not mark the new widget', (done) => {
      setTimeout(() => {
        done();
        expect(document.getElementById('three').dataset.vvidget_widgetOne).toBe(undefined);
      }, 50);
    });
  });

  describe('when another widget is appended', () => {
    beforeEach(() => {
      document.body.insertAdjacentHTML('beforeend', `<div id='three' ue='widget-one' data-widget-one-x=1></div>`);
    });

    test('does not mark the new widget', (done) => {
      setTimeout(() => {
        done();
        expect(document.getElementById('three').dataset.vvidget_widgetOne).toBe(undefined);
      }, 50);
    });

    describe('when page refresh is triggered', () => {
      test('does not calls widget-two again', (done) => {
        trigger(document, 'page-refreshed');

        setTimeout(() => {
          done();
          expect(two).toHaveBeenCalledTimes(1);
        }, 50);
      });

      test('calls widget-one on three', (done) => {
        trigger(document, 'page-refreshed');

        setTimeout(() => {
          done();
          expect(one).toHaveBeenCalledTimes(2);
        }, 50);
      });

      test('marks the new widget', (done) => {
        trigger(document, 'page-refreshed');

        setTimeout(() => {
          done();
          expect(document.getElementById('three').dataset.vvidget_widgetOne).toBe('true');
        }, 50);
      });
    });

    describe('when fragment refresh is triggered', () => {
      test('calls widget-one on three', (done) => {
        trigger(document.getElementById('three'), 'page-refreshed');

        setTimeout(() => {
          done();
          expect(one).toHaveBeenCalledTimes(2);
        }, 50);
      });

      test('marks the new widget', (done) => {
        trigger(document.getElementById('three'), 'page-refreshed');

        setTimeout(() => {
          done();
          expect(document.getElementById('three').dataset.vvidget_widgetOne).toBe('true');
        }, 50);
      });
    });
  });
});
