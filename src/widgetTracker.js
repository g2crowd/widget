export const widgetTracker = function () {
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
