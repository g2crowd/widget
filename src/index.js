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

import $ from 'jquery';
import { extractOptions } from '@g2crowd/extract-options';
import camelize from './camelize';
import queue from './queue';
import initiationStrategies from './initiationStrategies';
import selectorBuilder from './selectorBuilder';

class AlreadyRegisteredError extends Error {
  constructor(name) {
    super();
    this.name = 'AlreadyRegisteredError';
    this.message = `${name} has already been registered.`;
  }
}

const widgetQueue = queue();

const strategies = initiationStrategies({
  nextTick(pluginFn, $$) {
    return window.setTimeout(() => pluginFn(), 0);
  },

  immediate(pluginFn, $$) {
    return pluginFn() || {};
  },

  hover(pluginFn, $$) {
    return $$.one('mouseover', () => pluginFn());
  }
});

function emit($el, eventName) {
  const event = new CustomEvent(eventName);
  $el.get(0).dispatchEvent(event);
}

const widget = function({ attr, data }, loadEvents, fragmentLoadEvents) {
  const selector = selectorBuilder({ attr, data });
  const registered = {};

  const register = function(name, plugin, settings = {}) {
    if (registered[name]) {
      throw new AlreadyRegisteredError(name);
    }
    plugin.defaults = settings.defaults || {};
    plugin.init = settings.init || 'nextTick';
    registered[name] = plugin;
  };

  const wrapPlugin = function wrapPlugin(name, pluginFn, $$) {
    const ready = function ready() {
      emit($$, 'vvidget:initialized');
    };

    return function() {
      const pluginName = camelize(name);
      const options = $.extend({}, pluginFn.defaults, extractOptions($$.data(), pluginName));
      pluginFn.call($$, options, ready);
    };
  };

  const loadWidget = function($$, name) {
    if (name) {
      const existingPlugin = $$.data(`vvidget:${name}`);
      const pluginFn = registered[name];

      if (!pluginFn) {
        return;
      }

      const wrapped = wrapPlugin(name, pluginFn, $$);

      if (!existingPlugin) {
        widgetQueue.add(() => {
          strategies.get(pluginFn.init)(wrapped, $$);
        });
        widgetQueue.flush();

        $$.data(`vvidget:${name}`, true);
      }
    }
  };

  const initWidgets = function($elements) {
    $elements.each(function() {
      const $$ = $(this);
      const names = `${$$.data(data) || ''} ${$$.attr(attr) || ''}`;

      names.split(' ').forEach(name => loadWidget($$, name));
    });
  };

  $(document).on(loadEvents, function() {
    initWidgets($(selector));
  });

  $(document).on(fragmentLoadEvents, 'html *', function() {
    initWidgets(
      $(this)
        .find(selector)
        .addBack(selector)
    );
    return false;
  });

  register.initAllWidgets = () => $(document).ready(() => initWidgets($(selector)));

  register.strategies = strategies;

  return register;
};

export default widget;
