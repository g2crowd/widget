import initiationStrategies from './initiationStrategies';

export const strategies = initiationStrategies({
  nextTick(pluginFn, el) {
    return window.setTimeout(() => pluginFn(), 0);
  },

  immediate(pluginFn, el) {
    return pluginFn() || {};
  },

  hover(pluginFn, el) {
    return el.addEventListener('mouseover', pluginFn, { once: true });
  }
});
