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

import selectorBuilder from './selectorBuilder';
import { widgetInitiator } from './initWidgets';
import { strategies } from './strategies';
import { mutationObserver } from './mutationObserver';

class AlreadyRegisteredError extends Error {
  constructor(name) {
    super();
    this.name = 'AlreadyRegisteredError';
    this.message = `${name} has already been registered.`;
  }
}

const widget = function ({ attr, data }, loadEvents, fragmentLoadEvents, teardownEvents) {
  const selector = selectorBuilder({ attr, data });
  const registered = {};
  const init = widgetInitiator({ attr, data, registered });
  teardownEvents = teardownEvents || 'vvidget:teardown';

  const register = function (name, plugin, settings = {}) {
    if (registered[name]) {
      throw new AlreadyRegisteredError(name);
    }
    plugin.defaults = settings.defaults || {};
    plugin.init = settings.init || 'nextTick';
    registered[name] = plugin;
  };

  function handleLoadEvents() {
    init.initWidgets(document.body.querySelectorAll(selector));
  }

  function handleFragmentLoadEvents(e) {
    const targetElement = e.target;

    if (targetElement && targetElement !== document) {
      const elements = targetElement.querySelectorAll(selector);

      if (targetElement.getAttribute(attr) || targetElement.getAttribute(`data-${data}`)) {
        init.initWidgets([targetElement]);
      }

      init.initWidgets(elements);
    } else {
      init.initWidgets(document.body.querySelectorAll(selector));
    }

    return false;
  }

  function handleTeardownEvents(e) {
    const element = e.target;
    const elements = element.querySelectorAll(selector);
    const widgetName = e.detail && e.detail.widgetName;

    if (element !== document) {
      init.teardownWidgets([element], widgetName);
    }

    init.teardownWidgets(elements, widgetName);
  }

  register.strategies = strategies;

  register.initAllWidgets = () => init.initWidgets(document.querySelectorAll(selector));
  register.teardownAllWidgets = () => {
    const event = new CustomEvent(teardownEvents, { bubbles: true });
    document.body.querySelectorAll(selector).forEach((el) => el.dispatchEvent(event));
  };

  register.restartAllWidgets = () => {
    register.teardownAllWidgets();
    register.initAllWidgets();
  };

  register.startWatchingEvents = () => {
    document.addEventListener(loadEvents, handleLoadEvents);
    document.addEventListener(fragmentLoadEvents, handleFragmentLoadEvents);
    document.addEventListener(teardownEvents, handleTeardownEvents);
  };

  register.stopWatchingEvents = () => {
    document.removeEventListener(loadEvents, handleLoadEvents);
    document.removeEventListener(fragmentLoadEvents, handleFragmentLoadEvents);
    document.removeEventListener(teardownEvents, handleTeardownEvents);
  };

  let observer;
  register.startWatchingDOM = () => {
    observer =
      observer ||
      mutationObserver(selector, {
        onAdd: (el) => init.initWidgets([el]),
        onRemove: (el) => init.teardownWidgets([el])
      });
    observer.observe();
  };

  register.stopWatchingDOM = () => {
    if (observer) {
      observer.disconnect();
    }
  };

  register.shutdown = () => {
    register.stopWatchingEvents();
    register.stopWatchingDOM();
  };

  register.startWatchingEvents();

  return register;
};

export default widget;
