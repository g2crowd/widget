import widget from '../src/index';

describe('with attr=ue and data=ue-widget', () => {
  let register, one, two, oneTeardown, twoTeardown;

  function trigger(element, event, data) {
    const evt = new CustomEvent(event, { bubbles: true, cancelable: true, ...data });
    element.dispatchEvent(evt);
  }

  beforeEach(() => {
    document.body.innerHTML = `
    <div id='wrapper'>
      <div id='one' ue='widget-one' data-widget-one-options='{ "x": 1 }'></div>
      <div id='two' data-ue-widget='widget-two' data-widget-two-z='z' data-widget-two-y-value=2></div>
    </div>
    `;
    register && register.shutdown();
    register = widget({ attr: 'ue', data: 'ue-widget' }, 'page-refreshed', 'page-refreshed');

    oneTeardown = jest.fn();
    twoTeardown = jest.fn();
    one = jest.fn((_el, _opts, ready) => ready(oneTeardown));
    two = jest.fn((_el, _opts, ready) => ready(twoTeardown));

    register(
      'widget-one',
      function (opts, ready) {
        one(this, opts, ready);
      },
      { init: 'immediate', defaults: { d: 'd' } }
    );
    register(
      'widget-two',
      function (opts, ready) {
        two(this, opts, ready);
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

  describe('when page-refresh is triggered', () => {
    test('does not call widget-one again', (done) => {
      trigger(document, 'page-refreshed');

      setTimeout(() => {
        done();

        expect(one).toHaveBeenCalledTimes(1);
      });
    });

    describe('when vvidget:teardown is triggered', () => {
      test('fires the teardown function', (done) => {
        trigger(document.getElementById('one'), 'vvidget:teardown', { detail: { widgetName: 'widget-one' } });

        setTimeout(() => {
          done();
          expect(oneTeardown).toHaveBeenCalledTimes(1);
        });
      });

      describe('when page-refresh is triggered again', () => {
        test('calls widget-one again', (done) => {
          trigger(document.getElementById('one'), 'vvidget:teardown', { detail: { widgetName: 'widget-one' } });
          trigger(document.getElementById('one'), 'vvidget:teardown', { detail: { widgetName: 'widget-two' } });
          trigger(document, 'page-refreshed');

          setTimeout(() => {
            done();
            expect(one).toHaveBeenCalledTimes(2);
            expect(two).toHaveBeenCalledTimes(1);
          });
        });
      });

      describe('without a specific widget name', () => {
        beforeEach(() => {
          document.body.insertAdjacentHTML(
            'beforeend',
            `<div id='three' ue='widget-one widget-two' data-widget-one-x=1></div>`
          );
        });

        test('tears down all widgets', (done) => {
          trigger(document.getElementById('three'), 'page-refreshed');
          trigger(document.getElementById('three'), 'vvidget:teardown');

          setTimeout(() => {
            done();
            expect(oneTeardown).toHaveBeenCalledTimes(1);
            expect(twoTeardown).toHaveBeenCalledTimes(1);
          });
        });

        test('tears down child widgets', (done) => {
          trigger(document.body, 'page-refreshed');
          trigger(document.body, 'vvidget:teardown');

          setTimeout(() => {
            done();
            expect(oneTeardown).toHaveBeenCalledTimes(2);
            expect(twoTeardown).toHaveBeenCalledTimes(2);
          });
        });
      });
    });
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
        });
      });
    });
  });

  describe('when watching mutations', () => {
    afterEach(() => {
      register.stopWatchingDOM();
    });

    describe('when a widget is added', () => {
      beforeEach(() => {
        register.startWatchingDOM();
        document.body.insertAdjacentHTML('beforeend', `<div id='three' ue='widget-one' data-widget-one-x=1></div>`);
      });

      test('calls widget-one on three', () => {
        expect(one).toHaveBeenCalledTimes(2);
      });
    });

    describe('when container with widgets is added', () => {
      beforeEach(() => {
        const container = document.createElement('div');
        container.innerHTML = `
        <div id='four' ue='widget-one' data-widget-one-x=1></div>
        <div id='five' ue='widget-two' data-widget-two-y=2></div>
        `;
        register.startWatchingDOM();
        document.body.appendChild(container);
      });

      test('it inits the new widgets', () => {
        expect(one).toHaveBeenCalledTimes(2);
        expect(two).toHaveBeenCalledTimes(2);
      });
    });

    describe('when a widget is removed', () => {
      beforeEach(() => {
        register.startWatchingDOM();
        document.getElementById('one').remove();
      });

      test('tears down the widget', () => {
        expect(oneTeardown).toHaveBeenCalledTimes(1);
      });
    });

    describe('when removing the wrapping content', () => {
      beforeEach(() => {
        register.startWatchingDOM();
        document.getElementById('wrapper').remove();
      });

      test('tears down all the widgets', () => {
        expect(oneTeardown).toHaveBeenCalledTimes(1);
        expect(twoTeardown).toHaveBeenCalledTimes(1);
      });
    });
  });
});
