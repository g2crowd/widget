# vvidget

vvidget is an abstraction for creating uniform jQuery plugins.

It creates plugins that take care of a few problems:

* Use a single naming-and-selector convention for defining all widgets
  * Helps avoid lots of random selectors sprinkled through the code
  * You always know which DOM elements are carrying one of these widgets
* Reliably binding to ready and page-refresh events, to initialize ajax-loaded elements once and only once.
  * Helps manage PJAX reloads and HTML fragment injection
  * Nested widgets can be easily and safely activated
* Loading options from data attributes.
  * Namespaces keep collisions from occurring, so a single DOM element can safely be host to multiple widgets

## Basic usage

Create an instance of the plugin builder with your preferred configuration:

```javascript
import widgetSetup from 'widget';

const widget = widgetSetup({ attr: 'ue', data: 'ue-widget' }, 'page-refreshed', 'page-refreshed');
// DOM elements with selector of `ue`, or `data-ue-widget` will activate widgets created with this
// config
```

This configuration let's us describe widgets and pass options in data attributes:

```html
<div class='simple-widget'
     data-ue-widget='widget-name'
     data-widget-name-option-one='option1'
     data-widget-name-option-two='option2'>
```

This will be mapped to the plugin we create with the matching name:

```javascript
widget('widget-name', function(opts) {
  $el = this;
}, {
  defaults: {},
  init: 'nextTick'
});
```

### Multiple widgets

You may attach multiple widgets to the same DOM element by
separating the widget names with a space character.

Example:

```html
<div data-ue-widget='widget-1 widget-2'></div>
```

This is equivalent to:

```html
<div ue='widget-1 widget-2'></div>
```

### Page refreshes

Widgets will listen for a custom event of your choosing, and initialize themselves once per DOM node. This allows
you to trigger the event repeatedly without unintended side effects. The event can be triggered on HTML fragments or
on the entire document.

```javascript
widget('remote-resource', function(opts) {
  fetch('/example').then((htmlFragment) => {
    this.append(htmlFragment);
    this.trigger('page-refreshed');

    // any widgets nested within the HTML fragment will be activated
  });
})
```
