export function nextTick(pluginFn, _el) {
  return window.setTimeout(() => pluginFn(), 0);
}
export function immediate(pluginFn, _el) {
  return pluginFn() || {};
}
export function hover(pluginFn, el) {
  const isJqueryEl = el.jquery !== undefined;
  return isJqueryEl ?
    el.one('mouseover', pluginFn) :
    el.addEventListener('mouseover', pluginFn, { once: true });
}
export function fallback(strategy, fallback) {
  console.warn(`Strategy ${strategy} not found, falling back to ${fallback.name} strategy.`);
  return fallback;
}
