export const mutationObserver = function (selector, { onAdd = () => {}, onRemove = () => {} } = {}) {
  function eachWidget(nodeList, fn) {
    const elements = Array.from(nodeList).filter((node) => node.nodeType === 1);

    elements.forEach((el) => {
      if (el.matches(selector)) {
        fn(el);
      }

      const widgets = el.querySelectorAll(selector);
      widgets.forEach(fn);
    });
  }

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        eachWidget(mutation.removedNodes, onRemove);
        eachWidget(mutation.addedNodes, onAdd);
      }
    });
  });

  return {
    observe: () =>
      observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
      }),
    disconnect: () => observer.disconnect()
  };
};
