import { extractOptions } from '@g2crowd/extract-options';
import camelize from './camelize';
import { strategies } from './strategies';
import { widgetTracker } from './widgetTracker';

function simpleCaste(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

function sanitizeDataset(dataset) {
  const sanitized = {};

  Object.entries(dataset).forEach(function ([key, value]) {
    sanitized[key] = simpleCaste(value);
  });

  return sanitized;
}

function emit(element, eventName, data) {
  const event = new CustomEvent(eventName, { detail: data });
  element.dispatchEvent(event);
}

export const widgetInitiator = function ({ attr, data, registered, teardowns, initiatedWidgets }, fn) {
  const availableWidgets = registered || {};
  initiatedWidgets = initiatedWidgets || widgetTracker();

  const wrapTeardown = function wrapTeardown(name, teardownFn, element) {
    return function () {
      if (typeof teardownFn === 'function') {
        teardownFn();
      }

      initiatedWidgets.set(name, element, false);
      delete element.dataset[`vvidget_${camelize(name)}`];
    };
  };

  const wrapPlugin = function wrapPlugin(name, pluginFn, element) {
    const ready = function ready(teardown) {
      teardowns.set(name, element, teardown);
      emit(element, 'vvidget:initialized');
    };

    return function () {
      const pluginName = camelize(name);
      const options = Object.assign(
        {},
        pluginFn.defaults,
        extractOptions(sanitizeDataset(element.dataset), pluginName)
      );
      return pluginFn.call(element, options, ready);
    };
  };

  async function startWidget(name, pluginFn, element) {
    const strategy = strategies.get(pluginFn.init);
    const wrapped = wrapPlugin(name, pluginFn, element);

    strategy(wrapped, element);
  }

  const loadWidget = async function (element, name) {
    const pluginFn = availableWidgets[name];

    if (!pluginFn) {
      return;
    }

    if (initiatedWidgets.get(name, element)) {
      return;
    }

    startWidget(name, pluginFn, element);

    emit(element, 'vvidget:load', { name });
    initiatedWidgets.set(name, element, true);
    element.dataset[`vvidget_${camelize(name)}`] = true;
  };

  fn = fn || loadWidget;

  return function initWidgets(elements) {
    elements.forEach(function (element) {
      const names = `${element.dataset[camelize(data)] || ''} ${element.getAttribute(attr) || ''}`;

      names
        .split(' ')
        .filter((i) => i)
        .forEach((name) => fn(element, name));
    });
  };
};
