import queue from './queue';
import { extractOptions } from '@g2crowd/extract-options';
import camelize from './camelize';
import { strategies } from './strategies';

const widgetTracker = function () {
  const elements = new WeakMap();

  return {
    get: function (widgetName, element) {
      const widgets = elements.get(element);

      return widgets && widgets.get(widgetName);
    },

    set: function (widgetName, element, value) {
      if (!elements.has(element)) {
        elements.set(element, new Map());
      }

      elements.get(element).set(widgetName, value);
    },

    has: function (widgetName, element) {
      return this.get(widgetName, element) !== undefined;
    }
  };
};

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

function emit(element, eventName) {
  const event = new CustomEvent(eventName);
  element.dispatchEvent(event);
}

const wrapPlugin = function wrapPlugin(name, pluginFn, element) {
  const ready = function ready() {
    emit(element, 'vvidget:initialized');
  };

  return function () {
    const pluginName = camelize(name);
    const options = Object.assign({}, pluginFn.defaults, extractOptions(sanitizeDataset(element.dataset), pluginName));
    pluginFn.call(element, options, ready);
  };
};

const loadWidget = function (element, name, widgetQueue, registered, initiatedWidgets) {
  const pluginFn = registered[name];

  if (!pluginFn) {
    return;
  }

  const existingPlugin = initiatedWidgets.get(name, element);
  const wrapped = wrapPlugin(name, pluginFn, element);

  if (!existingPlugin) {
    widgetQueue.add(() => {
      strategies.get(pluginFn.init)(wrapped, element);
    });
    widgetQueue.flush();

    initiatedWidgets.set(name, element, true);
    element.dataset[`vvidget_${camelize(name)}`] = true;
  }
};

const initiatedWidgets = widgetTracker();
export const widgetInitiator = function ({ attr, data, registered }, fn = loadWidget) {
  const widgetQueue = queue();
  registered = registered || {};

  return function initWidgets(elements) {
    elements.forEach(function (element) {
      const names = `${element.dataset[camelize(data)] || ''} ${element.getAttribute(attr) || ''}`;

      names
        .split(' ')
        .filter((i) => i)
        .forEach((name) => fn(element, name, widgetQueue, registered, initiatedWidgets));
    });
  };
};
