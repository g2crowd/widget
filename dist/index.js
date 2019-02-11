"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.function.name");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.map");

require("core-js/modules/es6.reflect.construct");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.set-prototype-of");

var _jquery = _interopRequireDefault(require("jquery"));

var _extractOptions = _interopRequireDefault(require("@g2crowd/extract-options"));

var _camelize = _interopRequireDefault(require("./camelize"));

var _initiationStrategies = _interopRequireDefault(require("./initiationStrategies"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var AlreadyRegisteredError =
/*#__PURE__*/
function (_Error) {
  _inherits(AlreadyRegisteredError, _Error);

  function AlreadyRegisteredError(name) {
    var _this;

    _classCallCheck(this, AlreadyRegisteredError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AlreadyRegisteredError).call(this));
    _this.name = 'AlreadyRegisteredError';
    _this.message = "".concat(name, " has already been registered.");
    return _this;
  }

  return AlreadyRegisteredError;
}(_wrapNativeSuper(Error));

var strategies = (0, _initiationStrategies.default)({
  nextTick: function nextTick(pluginFn, $$, options) {
    return window.setTimeout(function () {
      return pluginFn.call($$, options);
    }, 0);
  },
  immediate: function immediate(pluginFn, $$, options) {
    return pluginFn.call($$, options) || {};
  },
  hover: function hover(pluginFn, $$, options) {
    return $$.one('mouseover', function () {
      return pluginFn.call($$, options);
    });
  }
});

var widget = function widget(selector, loadEvents, fragmentLoadEvents) {
  var registered = widgetRegistry();

  var register = function register(name, plugin) {
    var settings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    registered.add(name, plugin, settings);

    if (registered[name]) {
      throw new AlreadyRegisteredError(name);
    }

    plugin.defaults = settings.defaults || {};
    plugin.init = settings.init || 'nextTick';
    registered[name] = plugin;
  };

  var loadWidget = function loadWidget($$, name, data) {
    if (name) {
      var existingPlugin = $$.data("vvidget:".concat(name));
      var pluginFn = registered.get(name);

      if (!pluginFn) {
        return;
      }

      if (!existingPlugin) {
        var pluginName = (0, _camelize.default)(name);

        var options = _jquery.default.extend({}, pluginFn.defaults, (0, _extractOptions.default)(data, pluginName));

        _initiationStrategies.default[pluginFn.init](pluginFn, $$, options);

        $$.data("vvidget:".concat(name), true);
      }
    }
  };

  var initWidgets = function initWidgets($elements) {
    $elements.each(function () {
      var $$ = (0, _jquery.default)(this);
      var data = $$.data();
      var names = "".concat($$.data().ueWidget || '', " ").concat($$.attr('ue') || '');
      names.split(' ').forEach(function (name) {
        return loadWidget($$, name, data);
      });
      $$.trigger('vvidget:ready');
    });
  };

  (0, _jquery.default)(document).on(loadEvents, function () {
    initWidgets((0, _jquery.default)(selector));
  });
  (0, _jquery.default)(document).on(fragmentLoadEvents, 'html *', function () {
    initWidgets((0, _jquery.default)(this).find(selector).addBack(selector));
    return false;
  });

  register.initAllWidgets = function () {
    return (0, _jquery.default)(document).ready(function () {
      return initWidgets((0, _jquery.default)(selector));
    });
  };

  register.strategies = strategies;
  return register;
};

var _default = widget('[data-ue-widget],[ue]', 'page-refreshed', 'page-refreshed');

exports.default = _default;