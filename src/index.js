// @format
// vvidget
// by Mike
//
// This is a widget abstraction for creating uniform JavaScript
// plugins.
//
// The widget takes care of a few problems:
//
// Allowing new JavaScript plugins to be added without adding extra
// DOM crawling,
//
// Reliably binding to ready and page-refresh events, to
// initialize ajax-loaded elements once and only once.
//
// Loading options from namespaced data attributes.
//
// Example:
//
// HTML:
//     <div class='simple-widget'
//          data-ue-widget='widget-name'
//          data-widget-name-option-one='option1'
//          data-widget-name-option-two='option2'>
//
// Create Plugin:
//     widget('widget-name', function(opts) {
//       const el = this;
//     }, {
//       defaults: {},
//       init: 'nextTick'
//     });
//
// You may attach multiple widgets to the same DOM element by
// separating the widget names with a space character.
//
// Example:
//
// HTML:
//     <div data-ue-widget='widget-1 widget-2'></div>
//
// You can also create a "ue" attribute as a shortcut for
// data-ue-widget:
//
// HTML:
//     <div ue='widget-1 widget-2'></div>

import initWidgets from './initWidgets';
import selectorBuilder from './selectorBuilder';
import { widgetInitiator } from './initWidgets';
import { strategies } from './strategies';
import { widgetTracker } from './widgetTracker';
import camelize from './camelize';

class AlreadyRegisteredError extends Error {
  constructor(name) {
    super();
    this.name = 'AlreadyRegisteredError';
    this.message = `${name} has already been registered.`;
  }
}

const widget = function ({ attr, data }, loadEvents, fragmentLoadEvents) {
  const selector = selectorBuilder({ attr, data });
  const registered = {};
  const teardowns = widgetTracker();
  const initiatedWidgets = widgetTracker();
  const initWidgets = widgetInitiator({ attr, data, registered, teardowns, initiatedWidgets });

  const register = function (name, plugin, settings = {}) {
    if (registered[name]) {
      throw new AlreadyRegisteredError(name);
    }
    plugin.defaults = settings.defaults || {};
    plugin.init = settings.init || 'nextTick';
    registered[name] = plugin;
  };

  function handleLoadEvents() {
    initWidgets(document.body.querySelectorAll(selector));
  }

  function handleFragmentLoadEvents(e) {
    const targetElement = e.target;

    if (targetElement && targetElement !== document) {
      const elements = targetElement.querySelectorAll(selector);

      if (targetElement.getAttribute(attr) || targetElement.getAttribute(`data-${data}`)) {
        initWidgets([targetElement]);
      }

      initWidgets(elements);
    }

    return false;
  }

  function teardownWidget(element, widgetName) {
    const teardown = teardowns.get(widgetName, element);
    const initiated = initiatedWidgets.get(widgetName, element);

    if (teardown && typeof teardown === 'function') {
      teardown();
      teardowns.set(widgetName, element, undefined);
    }

    if (initiated) {
      initiatedWidgets.set(widgetName, element, undefined);
      delete element.dataset[`vvidget_${camelize(widgetName)}`];
    }
  }

  function handleTeardownEvents(e) {
    const element = e.target;
    const widgetName = e.detail && e.detail.widgetName;

    if (widgetName) {
      teardownWidget(element, widgetName);
    } else {
      const names = `${element.dataset[camelize(data)] || ''} ${element.getAttribute(attr) || ''}`;

      names
        .split(' ')
        .filter((i) => i)
        .forEach((name) => teardownWidget(element, name));
    }
  }

  document.addEventListener(loadEvents, handleLoadEvents);
  document.addEventListener(fragmentLoadEvents, handleFragmentLoadEvents);
  document.addEventListener('vvidget:teardown', handleTeardownEvents);

  register.strategies = strategies;

  register.initAllWidgets = () => initWidgets(document.querySelectorAll(selector));
  register.teardownAllWidgets = () => {
    const event = new CustomEvent('vvidget:teardown', { bubbles: true });
    document.body.querySelectorAll(selector).forEach((el) => el.dispatchEvent(event));
  };
  register.restartAllWidgets = () => {
    register.teardownAllWidgets();
    register.initAllWidgets();
  };
  register.shutdown = () => {
    register.teardownAllWidgets();
    document.removeEventListener(loadEvents, handleLoadEvents);
    document.removeEventListener(fragmentLoadEvents, handleFragmentLoadEvents);
    document.removeEventListener('vvidget:teardown', handleTeardownEvents);
  };

  return register;
};

export default widget;
