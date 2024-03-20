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

export const widgetInitiator = function ({ attr, data, registered, initiatedWidgets }) {
  const availableWidgets = registered || {};
  initiatedWidgets = initiatedWidgets || widgetTracker();

  const wrapPlugin = function wrapPlugin(name, pluginFn, element, resolve) {
    const ready = function ready(teardown) {
      resolve(teardown);
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

  function startWidget(name, pluginFn, element) {
    const widgetPromise = new Promise(function (resolve) {
      const strategy = strategies.get(pluginFn.init);
      const wrapped = wrapPlugin(name, pluginFn, element, resolve);

      strategy(wrapped, element);
    });

    initiatedWidgets.set(name, element, widgetPromise);
    return widgetPromise;
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
    element.dataset[`vvidget_${camelize(name)}`] = true;
  };

  function parseWidgetNames(element) {
    const str = `${element.dataset[camelize(data)] || ''} ${element.getAttribute(attr) || ''}`;
    return str.split(' ').filter((i) => i);
  }

  function teardownWidget(element, names) {
    names.forEach((name) => {
      const widgetPromise = initiatedWidgets.get(name, element);

      if (widgetPromise) {
        widgetPromise.then((teardown) => {
          if (teardown && typeof teardown === 'function') {
            teardown();
          }
        });

        initiatedWidgets.set(name, element, undefined);
        delete element.dataset[`vvidget_${camelize(name)}`];
      }
    });
  }

  return {
    initWidgets: (elements) => {
      elements.forEach(function (element) {
        parseWidgetNames(element).forEach((name) => loadWidget(element, name));
      });
    },

    teardownWidgets: (elements, widgetName) => {
      elements.forEach((element) => {
        const names = widgetName ? [widgetName] : parseWidgetNames(element);

        teardownWidget(element, names);
      });
    }
  };
};
