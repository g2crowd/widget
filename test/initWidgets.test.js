// @format

import { widgetInitiator } from '../src/initWidgets';

describe('with attr=ue and data=ue-widget', () => {
  let initWidgets, callback, body, registered;

  describe('without spy', () => {
    beforeEach(() => {
      const fn = jest.fn();
      fn.init = 'immediate';
      fn.defaults = {};
      registered = {
        'widget-name': fn
      };
      initWidgets = widgetInitiator({ attr: 'ue', data: 'ue-widget', registered });
      body = document.createElement('div');
      body.innerHTML = `
        <div ue="widget-name"></div>
        <div ue="widget-name"></div>
        <div ue="widget-name"></div>
        <div ue="widget-name"></div>
        <div ue="widget-name"></div>
      `;
    });

    test('it should mark each element as initialized', () => {
      const elements = body.querySelectorAll('[ue],[data-ue-widget]');

      initWidgets(elements);

      expect(elements[0].dataset.vvidget_widgetName).toBe('true');
    });
  });

  describe('with spy', () => {
    beforeEach(() => {
      callback = jest.fn();
      initWidgets = widgetInitiator({ attr: 'ue', data: 'ue-widget' }, callback);
    });

    test('it should return a function', () => {
      expect(initWidgets).toBeInstanceOf(Function);
    });

    describe('with the attr attribute', () => {
      beforeEach(() => {
        body = document.createElement('div');
        body.innerHTML = `
        <div ue="widget-name"></div>
        <div ue="widget-name"></div>
        <div ue="widget-name"></div>
        <div ue="widget-name"></div>
        <div ue="widget-name"></div>
      `;
      });

      test('it should call the callback for each element', () => {
        const elements = body.querySelectorAll('[ue],[data-ue-widget]');

        initWidgets(elements);
        expect(callback).toHaveBeenCalledTimes(5);
      });
    });

    describe('with the data attribute', () => {
      beforeEach(() => {
        body = document.createElement('div');
        body.innerHTML = `
        <div data-ue-widget="widget-name"></div>
        <div data-ue-widget="widget-name"></div>
        <div data-ue-widget="widget-name"></div>
        <div data-ue-widget="widget-name"></div>
        <div data-ue-widget="widget-name"></div>
      `;
      });

      test('it should call the callback for each element', () => {
        const elements = body.querySelectorAll('[ue],[data-ue-widget]');

        initWidgets(elements);
        expect(callback).toHaveBeenCalledTimes(5);
      });
    });
  });
});
