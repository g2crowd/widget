import initiationStrategies from './initiationStrategies';

export const strategies = initiationStrategies({
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
