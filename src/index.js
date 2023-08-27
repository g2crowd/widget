// @format
// vvidget
// by Mike
//
// This is a widget abstraction for creating uniform jQuery
// plugins.
//
// The widget takes care of a few problems:
//
// Allowing new jQuery plugins to be added without adding extra
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
//       $el = this;
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
  const initWidgets = widgetInitiator({ attr, data, registered });

  const register = function (name, plugin, settings = {}) {
    if (registered[name]) {
      throw new AlreadyRegisteredError(name);
    }
    plugin.defaults = settings.defaults || {};
    plugin.init = settings.init || 'nextTick';
    registered[name] = plugin;
  };

  document.addEventListener(loadEvents, function () {
    initWidgets(document.body.querySelectorAll(selector));
  });

  document.addEventListener(fragmentLoadEvents, function (e) {
    const targetElement = e.target;

    if (targetElement && targetElement !== document) {
      const elements = targetElement.querySelectorAll(selector);

      if (targetElement.getAttribute(attr) || targetElement.getAttribute(`data-${data}`)) {
        initWidgets([targetElement]);
      }

      initWidgets(elements);
    }

    return false;
  });

  register.initAllWidgets = () => initWidgets(document.querySelectorAll(selector));

  register.strategies = strategies;

  return register;
};

export default widget;
