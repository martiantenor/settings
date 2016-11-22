/**
   * @demo demo/index.html
   * @polymerBehavior
   */
  Polymer.IronControlState = {

    properties: {

      /**
       * If true, the element currently has focus.
       */
      focused: {
        type: Boolean,
        value: false,
        notify: true,
        readOnly: true,
        reflectToAttribute: true
      },

      /**
       * If true, the user cannot interact with this element.
       */
      disabled: {
        type: Boolean,
        value: false,
        notify: true,
        observer: '_disabledChanged',
        reflectToAttribute: true
      },

      _oldTabIndex: {
        type: Number
      },

      _boundFocusBlurHandler: {
        type: Function,
        value: function() {
          return this._focusBlurHandler.bind(this);
        }
      }

    },

    observers: [
      '_changedControlState(focused, disabled)'
    ],

    ready: function() {
      this.addEventListener('focus', this._boundFocusBlurHandler, true);
      this.addEventListener('blur', this._boundFocusBlurHandler, true);
    },

    _focusBlurHandler: function(event) {
      // NOTE(cdata):  if we are in ShadowDOM land, `event.target` will
      // eventually become `this` due to retargeting; if we are not in
      // ShadowDOM land, `event.target` will eventually become `this` due
      // to the second conditional which fires a synthetic event (that is also
      // handled). In either case, we can disregard `event.path`.

      if (event.target === this) {
        this._setFocused(event.type === 'focus');
      } else if (!this.shadowRoot) {
        var target = /** @type {Node} */(Polymer.dom(event).localTarget);
        if (!this.isLightDescendant(target)) {
          this.fire(event.type, {sourceEvent: event}, {
            node: this,
            bubbles: event.bubbles,
            cancelable: event.cancelable
          });
        }
      }
    },

    _disabledChanged: function(disabled, old) {
      this.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      this.style.pointerEvents = disabled ? 'none' : '';
      if (disabled) {
        this._oldTabIndex = this.tabIndex;
        this._setFocused(false);
        this.tabIndex = -1;
        this.blur();
      } else if (this._oldTabIndex !== undefined) {
        this.tabIndex = this._oldTabIndex;
      }
    },

    _changedControlState: function() {
      // _controlStateChanged is abstract, follow-on behaviors may implement it
      if (this._controlStateChanged) {
        this._controlStateChanged();
      }
    }

  };
/**
   * Singleton IronMeta instance.
   */
  Polymer.IronValidatableBehaviorMeta = null;

  /**
   * `Use Polymer.IronValidatableBehavior` to implement an element that validates user input.
   * Use the related `Polymer.IronValidatorBehavior` to add custom validation logic to an iron-input.
   *
   * By default, an `<iron-form>` element validates its fields when the user presses the submit button.
   * To validate a form imperatively, call the form's `validate()` method, which in turn will
   * call `validate()` on all its children. By using `Polymer.IronValidatableBehavior`, your
   * custom element will get a public `validate()`, which
   * will return the validity of the element, and a corresponding `invalid` attribute,
   * which can be used for styling.
   *
   * To implement the custom validation logic of your element, you must override
   * the protected `_getValidity()` method of this behaviour, rather than `validate()`.
   * See [this](https://github.com/PolymerElements/iron-form/blob/master/demo/simple-element.html)
   * for an example.
   *
   * ### Accessibility
   *
   * Changing the `invalid` property, either manually or by calling `validate()` will update the
   * `aria-invalid` attribute.
   *
   * @demo demo/index.html
   * @polymerBehavior
   */
  Polymer.IronValidatableBehavior = {

    properties: {

      /**
       * Name of the validator to use.
       */
      validator: {
        type: String
      },

      /**
       * True if the last call to `validate` is invalid.
       */
      invalid: {
        notify: true,
        reflectToAttribute: true,
        type: Boolean,
        value: false
      },

      /**
       * This property is deprecated and should not be used. Use the global
       * validator meta singleton, `Polymer.IronValidatableBehaviorMeta` instead.
       */
      _validatorMeta: {
        type: Object
      },

      /**
       * Namespace for this validator. This property is deprecated and should
       * not be used. For all intents and purposes, please consider it a
       * read-only, config-time property.
       */
      validatorType: {
        type: String,
        value: 'validator'
      },

      _validator: {
        type: Object,
        computed: '__computeValidator(validator)'
      }
    },

    observers: [
      '_invalidChanged(invalid)'
    ],

    registered: function() {
      Polymer.IronValidatableBehaviorMeta = new Polymer.IronMeta({type: 'validator'});
    },

    _invalidChanged: function() {
      if (this.invalid) {
        this.setAttribute('aria-invalid', 'true');
      } else {
        this.removeAttribute('aria-invalid');
      }
    },

    /**
     * @return {boolean} True if the validator `validator` exists.
     */
    hasValidator: function() {
      return this._validator != null;
    },

    /**
     * Returns true if the `value` is valid, and updates `invalid`. If you want
     * your element to have custom validation logic, do not override this method;
     * override `_getValidity(value)` instead.

     * @param {Object} value The value to be validated. By default, it is passed
     * to the validator's `validate()` function, if a validator is set.
     * @return {boolean} True if `value` is valid.
     */
    validate: function(value) {
      this.invalid = !this._getValidity(value);
      return !this.invalid;
    },

    /**
     * Returns true if `value` is valid.  By default, it is passed
     * to the validator's `validate()` function, if a validator is set. You
     * should override this method if you want to implement custom validity
     * logic for your element.
     *
     * @param {Object} value The value to be validated.
     * @return {boolean} True if `value` is valid.
     */

    _getValidity: function(value) {
      if (this.hasValidator()) {
        return this._validator.validate(value);
      }
      return true;
    },

    __computeValidator: function() {
      return Polymer.IronValidatableBehaviorMeta &&
          Polymer.IronValidatableBehaviorMeta.byKey(this.validator);
    }
  };
/**
  Polymer.IronFormElementBehavior enables a custom element to be included
  in an `iron-form`.

  @demo demo/index.html
  @polymerBehavior
  */
  Polymer.IronFormElementBehavior = {

    properties: {
      /**
       * Fired when the element is added to an `iron-form`.
       *
       * @event iron-form-element-register
       */

      /**
       * Fired when the element is removed from an `iron-form`.
       *
       * @event iron-form-element-unregister
       */

      /**
       * The name of this element.
       */
      name: {
        type: String
      },

      /**
       * The value for this element.
       */
      value: {
        notify: true,
        type: String
      },

      /**
       * Set to true to mark the input as required. If used in a form, a
       * custom element that uses this behavior should also use
       * Polymer.IronValidatableBehavior and define a custom validation method.
       * Otherwise, a `required` element will always be considered valid.
       * It's also strongly recommended to provide a visual style for the element
       * when its value is invalid.
       */
      required: {
        type: Boolean,
        value: false
      },

      /**
       * The form that the element is registered to.
       */
      _parentForm: {
        type: Object
      }
    },

    attached: function() {
      // Note: the iron-form that this element belongs to will set this
      // element's _parentForm property when handling this event.
      this.fire('iron-form-element-register');
    },

    detached: function() {
      if (this._parentForm) {
        this._parentForm.fire('iron-form-element-unregister', {target: this});
      }
    }

  };
Polymer({

    is: 'iron-autogrow-textarea',

    behaviors: [
      Polymer.IronFormElementBehavior,
      Polymer.IronValidatableBehavior,
      Polymer.IronControlState
    ],

    properties: {

      /**
       * Use this property instead of `value` for two-way data binding.
       * This property will be deprecated in the future. Use `value` instead.
       * @type {string|number}
       */
      bindValue: {
        observer: '_bindValueChanged',
        type: String
      },

      /**
       * The initial number of rows.
       *
       * @attribute rows
       * @type number
       * @default 1
       */
      rows: {
        type: Number,
        value: 1,
        observer: '_updateCached'
      },

      /**
       * The maximum number of rows this element can grow to until it
       * scrolls. 0 means no maximum.
       *
       * @attribute maxRows
       * @type number
       * @default 0
       */
      maxRows: {
       type: Number,
       value: 0,
       observer: '_updateCached'
      },

      /**
       * Bound to the textarea's `autocomplete` attribute.
       */
      autocomplete: {
        type: String,
        value: 'off'
      },

      /**
       * Bound to the textarea's `autofocus` attribute.
       */
      autofocus: {
        type: Boolean,
        value: false
      },

      /**
       * Bound to the textarea's `inputmode` attribute.
       */
      inputmode: {
        type: String
      },

      /**
       * Bound to the textarea's `placeholder` attribute.
       */
      placeholder: {
        type: String
      },

      /**
       * Bound to the textarea's `readonly` attribute.
       */
      readonly: {
        type: String
      },

      /**
       * Set to true to mark the textarea as required.
       */
      required: {
        type: Boolean
      },

      /**
       * The maximum length of the input value.
       */
      maxlength: {
        type: Number
      }

    },

    listeners: {
      'input': '_onInput'
    },

    observers: [
      '_onValueChanged(value)'
    ],

    /**
     * Returns the underlying textarea.
     * @type HTMLTextAreaElement
     */
    get textarea() {
      return this.$.textarea;
    },

    /**
     * Returns textarea's selection start.
     * @type Number
     */
    get selectionStart() {
      return this.$.textarea.selectionStart;
    },

    /**
     * Returns textarea's selection end.
     * @type Number
     */
    get selectionEnd() {
      return this.$.textarea.selectionEnd;
    },

    /**
     * Sets the textarea's selection start.
     */
    set selectionStart(value) {
      this.$.textarea.selectionStart = value;
    },

    /**
     * Sets the textarea's selection end.
     */
    set selectionEnd(value) {
      this.$.textarea.selectionEnd = value;
    },

    /**
     * Returns true if `value` is valid. The validator provided in `validator`
     * will be used first, if it exists; otherwise, the `textarea`'s validity
     * is used.
     * @return {boolean} True if the value is valid.
     */
    validate: function() {
      // Empty, non-required input is valid.
      if (!this.required && this.value == '') {
        this.invalid = false;
        return true;
      }

      var valid;
      if (this.hasValidator()) {
        valid = Polymer.IronValidatableBehavior.validate.call(this, this.value);
      } else {
        valid = this.$.textarea.validity.valid;
        this.invalid = !valid;
      }
      this.fire('iron-input-validate');
      return valid;
    },

    _bindValueChanged: function() {
      var textarea = this.textarea;
      if (!textarea) {
        return;
      }

      // If the bindValue changed manually, then we need to also update
      // the underlying textarea's value. Otherwise this change was probably
      // generated from the _onInput handler, and the two values are already
      // the same.
      if (textarea.value !== this.bindValue) {
        textarea.value = !(this.bindValue || this.bindValue === 0) ? '' : this.bindValue;
      }

      this.value = this.bindValue;
      this.$.mirror.innerHTML = this._valueForMirror();
      // manually notify because we don't want to notify until after setting value
      this.fire('bind-value-changed', {value: this.bindValue});
    },

    _onInput: function(event) {
      this.bindValue = event.path ? event.path[0].value : event.target.value;
    },

    _constrain: function(tokens) {
      var _tokens;
      tokens = tokens || [''];
      // Enforce the min and max heights for a multiline input to avoid measurement
      if (this.maxRows > 0 && tokens.length > this.maxRows) {
        _tokens = tokens.slice(0, this.maxRows);
      } else {
        _tokens = tokens.slice(0);
      }
      while (this.rows > 0 && _tokens.length < this.rows) {
        _tokens.push('');
      }
      // Use &#160; instead &nbsp; of to allow this element to be used in XHTML.
      return _tokens.join('<br/>') + '&#160;';
    },

    _valueForMirror: function() {
      var input = this.textarea;
      if (!input) {
        return;
      }
      this.tokens = (input && input.value) ? input.value.replace(/&/gm, '&amp;').replace(/"/gm, '&quot;').replace(/'/gm, '&#39;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;').split('\n') : [''];
      return this._constrain(this.tokens);
    },

    _updateCached: function() {
      this.$.mirror.innerHTML = this._constrain(this.tokens);
    },

    _onValueChanged: function() {
      this.bindValue = this.value;
    }
  });
/**
   * Use `Polymer.NeonAnimationBehavior` to implement an animation.
   * @polymerBehavior
   */
  Polymer.NeonAnimationBehavior = {

    properties: {

      /**
       * Defines the animation timing.
       */
      animationTiming: {
        type: Object,
        value: function() {
          return {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'both'
          }
        }
      }

    },

    registered: function() {
      new Polymer.IronMeta({type: 'animation', key: this.is, value: this.constructor});
    },

    /**
     * Do any animation configuration here.
     */
    // configure: function(config) {
    // },

    /**
     * Returns the animation timing by mixing in properties from `config` to the defaults defined
     * by the animation.
     */
    timingFromConfig: function(config) {
      if (config.timing) {
        for (var property in config.timing) {
          this.animationTiming[property] = config.timing[property];
        }
      }
      return this.animationTiming;
    },

    /**
     * Sets `transform` and `transformOrigin` properties along with the prefixed versions.
     */
    setPrefixedProperty: function(node, property, value) {
      var map = {
        'transform': ['webkitTransform'],
        'transformOrigin': ['mozTransformOrigin', 'webkitTransformOrigin']
      };
      var prefixes = map[property];
      for (var prefix, index = 0; prefix = prefixes[index]; index++) {
        node.style[prefix] = value;
      }
      node.style[property] = value;
    },

    /**
     * Called when the animation finishes.
     */
    complete: function() {}

  };
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

/**
   * `Polymer.NeonAnimatableBehavior` is implemented by elements containing animations for use with
   * elements implementing `Polymer.NeonAnimationRunnerBehavior`.
   * @polymerBehavior
   */
  Polymer.NeonAnimatableBehavior = {

    properties: {

      /**
       * Animation configuration. See README for more info.
       */
      animationConfig: {
        type: Object
      },

      /**
       * Convenience property for setting an 'entry' animation. Do not set `animationConfig.entry`
       * manually if using this. The animated node is set to `this` if using this property.
       */
      entryAnimation: {
        observer: '_entryAnimationChanged',
        type: String
      },

      /**
       * Convenience property for setting an 'exit' animation. Do not set `animationConfig.exit`
       * manually if using this. The animated node is set to `this` if using this property.
       */
      exitAnimation: {
        observer: '_exitAnimationChanged',
        type: String
      }

    },

    _entryAnimationChanged: function() {
      this.animationConfig = this.animationConfig || {};
      if (this.entryAnimation !== 'fade-in-animation') {
        // insert polyfill hack
        this.animationConfig['entry'] = [{
          name: 'opaque-animation',
          node: this
        }, {
          name: this.entryAnimation,
          node: this
        }];
      } else {
        this.animationConfig['entry'] = [{
          name: this.entryAnimation,
          node: this
        }];
      }
    },

    _exitAnimationChanged: function() {
      this.animationConfig = this.animationConfig || {};
      this.animationConfig['exit'] = [{
        name: this.exitAnimation,
        node: this
      }];
    },

    _copyProperties: function(config1, config2) {
      // shallowly copy properties from config2 to config1
      for (var property in config2) {
        config1[property] = config2[property];
      }
    },

    _cloneConfig: function(config) {
      var clone = {
        isClone: true
      };
      this._copyProperties(clone, config);
      return clone;
    },

    _getAnimationConfigRecursive: function(type, map, allConfigs) {
      if (!this.animationConfig) {
        return;
      }

      // type is optional
      var thisConfig;
      if (type) {
        thisConfig = this.animationConfig[type];
      } else {
        thisConfig = this.animationConfig;
      }

      if (!Array.isArray(thisConfig)) {
        thisConfig = [thisConfig];
      }

      // iterate animations and recurse to process configurations from child nodes
      if (thisConfig) {
        for (var config, index = 0; config = thisConfig[index]; index++) {
          if (config.animatable) {
            config.animatable._getAnimationConfigRecursive(config.type || type, map, allConfigs);
          } else {
            if (config.id) {
              var cachedConfig = map[config.id];
              if (cachedConfig) {
                // merge configurations with the same id, making a clone lazily
                if (!cachedConfig.isClone) {
                  map[config.id] = this._cloneConfig(cachedConfig)
                  cachedConfig = map[config.id];
                }
                this._copyProperties(cachedConfig, config);
              } else {
                // put any configs with an id into a map
                map[config.id] = config;
              }
            } else {
              allConfigs.push(config);
            }
          }
        }
      }
    },

    /**
     * An element implementing `Polymer.NeonAnimationRunnerBehavior` calls this method to configure
     * an animation with an optional type. Elements implementing `Polymer.NeonAnimatableBehavior`
     * should define the property `animationConfig`, which is either a configuration object
     * or a map of animation type to array of configuration objects.
     */
    getAnimationConfig: function(type) {
      var map = {};
      var allConfigs = [];
      this._getAnimationConfigRecursive(type, map, allConfigs);
      // append the configurations saved in the map to the array
      for (var key in map) {
        allConfigs.push(map[key]);
      }
      return allConfigs;
    }

  };
Polymer({

    is: 'neon-animatable',

    behaviors: [
      Polymer.NeonAnimatableBehavior,
      Polymer.IronResizableBehavior
    ]

  });
Polymer({

    is: 'cascaded-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    properties: {

      /** @type {!Polymer.IronMeta} */
      _animationMeta: {
        type: Object,
        value: function() {
          return new Polymer.IronMeta({type: 'animation'});
        }
      }

    },

    /**
     * @param {{
     *   animation: string,
     *   nodes: !Array<!Element>,
     *   nodeDelay: (number|undefined),
     *   timing: (Object|undefined)
     *  }} config
     */
    configure: function(config) {
      var animationConstructor = /** @type {Function} */ (
          this._animationMeta.byKey(config.animation));
      if (!animationConstructor) {
        console.warn(this.is + ':', 'constructor for', config.animation, 'not found!');
        return;
      }

      this._animations = [];
      var nodes = config.nodes;
      var effects = [];
      var nodeDelay = config.nodeDelay || 50;

      config.timing = config.timing || {};
      config.timing.delay = config.timing.delay || 0;

      var oldDelay = config.timing.delay;
      for (var node, index = 0; node = nodes[index]; index++) {
        config.timing.delay += nodeDelay;
        config.node = node;

        var animation = new animationConstructor();
        var effect = animation.configure(config);

        this._animations.push(animation);
        effects.push(effect);
      }
      config.timing.delay = oldDelay;

      this._effect = new GroupEffect(effects);
      return this._effect;
    },

    complete: function() {
      for (var animation, index = 0; animation = this._animations[index]; index++) {
        animation.complete(animation.config);
      }
    }

  });
Polymer({

    is: 'fade-in-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;
      this._effect = new KeyframeEffect(node, [
        {'opacity': '0'},
        {'opacity': '1'}
      ], this.timingFromConfig(config));
      return this._effect;
    }

  });
Polymer({

    is: 'fade-out-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;
      this._effect = new KeyframeEffect(node, [
        {'opacity': '1'},
        {'opacity': '0'}
      ], this.timingFromConfig(config));
      return this._effect;
    }

  });
/**
   * Use `Polymer.NeonSharedElementAnimationBehavior` to implement shared element animations.
   * @polymerBehavior Polymer.NeonSharedElementAnimationBehavior
   */
  Polymer.NeonSharedElementAnimationBehaviorImpl = {

    properties: {

      /**
       * Cached copy of shared elements.
       */
      sharedElements: {
        type: Object
      }

    },

    /**
     * Finds shared elements based on `config`.
     */
    findSharedElements: function(config) {
      var fromPage = config.fromPage;
      var toPage = config.toPage;
      if (!fromPage || !toPage) {
        console.warn(this.is + ':', !fromPage ? 'fromPage' : 'toPage', 'is undefined!');
        return null;
      };

      if (!fromPage.sharedElements || !toPage.sharedElements) {
        console.warn(this.is + ':', 'sharedElements are undefined for', !fromPage.sharedElements ? fromPage : toPage);
        return null;
      };

      var from = fromPage.sharedElements[config.id]
      var to = toPage.sharedElements[config.id];

      if (!from || !to) {
        console.warn(this.is + ':', 'sharedElement with id', config.id, 'not found in', !from ? fromPage : toPage);
        return null;
      }

      this.sharedElements = {
        from: from,
        to: to
      };
      return this.sharedElements;
    }

  };

  /** @polymerBehavior Polymer.NeonSharedElementAnimationBehavior */
  Polymer.NeonSharedElementAnimationBehavior = [
    Polymer.NeonAnimationBehavior,
    Polymer.NeonSharedElementAnimationBehaviorImpl
  ];
Polymer({

    is: 'hero-animation',

    behaviors: [
      Polymer.NeonSharedElementAnimationBehavior
    ],

    configure: function(config) {
      var shared = this.findSharedElements(config);
      if (!shared) {
        return;
      }

      var fromRect = shared.from.getBoundingClientRect();
      var toRect = shared.to.getBoundingClientRect();

      var deltaLeft = fromRect.left - toRect.left;
      var deltaTop = fromRect.top - toRect.top;
      var deltaWidth = fromRect.width / toRect.width;
      var deltaHeight = fromRect.height / toRect.height;

      this.setPrefixedProperty(shared.to, 'transformOrigin', '0 0');
      shared.to.style.zIndex = 10000;
      shared.from.style.visibility = 'hidden';

      this._effect = new KeyframeEffect(shared.to, [
        {'transform': 'translate(' + deltaLeft + 'px,' + deltaTop + 'px) scale(' + deltaWidth + ',' + deltaHeight + ')'},
        {'transform': 'none'}
      ], this.timingFromConfig(config));

      return this._effect;
    },

    complete: function(config) {
      var shared = this.findSharedElements(config);
      if (!shared) {
        return null;
      }
      shared.to.style.zIndex = '';
      shared.from.style.visibility = '';
    }

  });
Polymer({

    is: 'ripple-animation',

    behaviors: [
      Polymer.NeonSharedElementAnimationBehavior
    ],

    configure: function(config) {
      var shared = this.findSharedElements(config);
      if (!shared) {
        return null;
      }

      var translateX, translateY;
      var toRect = shared.to.getBoundingClientRect();
      if (config.gesture) {
        translateX = config.gesture.x - (toRect.left + (toRect.width / 2));
        translateY = config.gesture.y - (toRect.top + (toRect.height / 2));
      } else {
        var fromRect = shared.from.getBoundingClientRect();
        translateX = (fromRect.left + (fromRect.width / 2)) - (toRect.left + (toRect.width / 2));
        translateY = (fromRect.top + (fromRect.height / 2)) - (toRect.top + (toRect.height / 2));
      }
      var translate = 'translate(' + translateX + 'px,' + translateY + 'px)';

      var size = Math.max(toRect.width + Math.abs(translateX) * 2, toRect.height + Math.abs(translateY) * 2);
      var diameter = Math.sqrt(2 * size * size);
      var scaleX = diameter / toRect.width;
      var scaleY = diameter / toRect.height;
      var scale = 'scale(' + scaleX + ',' + scaleY + ')';

      this.setPrefixedProperty(shared.to, 'transformOrigin', '50% 50%');
      shared.to.style.borderRadius = '50%';

      this._effect = new KeyframeEffect(shared.to, [
        {'transform': translate + ' scale(0)'},
        {'transform': translate + ' ' + scale}
      ], this.timingFromConfig(config));
      return this._effect;
    },

    complete: function() {
      if (this.sharedElements) {
        this.setPrefixedProperty(this.sharedElements.to, 'transformOrigin', '');
        this.sharedElements.to.style.borderRadius = '';
      }
    }

  });
Polymer({
    is: 'reverse-ripple-animation',

    behaviors: [
      Polymer.NeonSharedElementAnimationBehavior
    ],

    configure: function(config) {
      var shared = this.findSharedElements(config);
      if (!shared) {
        return null;
      }

      var translateX, translateY;
      var fromRect = shared.from.getBoundingClientRect();
      if (config.gesture) {
        translateX = config.gesture.x - (fromRect.left + (fromRect.width / 2));
        translateY = config.gesture.y - (fromRect.top + (fromRect.height / 2));
      } else {
        var toRect = shared.to.getBoundingClientRect();
        translateX = (toRect.left + (toRect.width / 2)) - (fromRect.left + (fromRect.width / 2));
        translateY = (toRect.top + (toRect.height / 2)) - (fromRect.top + (fromRect.height / 2));
      }
      var translate = 'translate(' + translateX + 'px,' + translateY + 'px)';

      var size = Math.max(fromRect.width + Math.abs(translateX) * 2, fromRect.height + Math.abs(translateY) * 2);
      var diameter = Math.sqrt(2 * size * size);
      var scaleX = diameter / fromRect.width;
      var scaleY = diameter / fromRect.height;
      var scale = 'scale(' + scaleX + ',' + scaleY + ')';

      this.setPrefixedProperty(shared.from, 'transformOrigin', '50% 50%');
      shared.from.style.borderRadius = '50%';

      this._effect = new KeyframeEffect(shared.from, [
        {'transform': translate + ' ' + scale},
        {'transform': translate + ' scale(0)'}
      ], this.timingFromConfig(config));
      return this._effect;
    },

    complete: function() {
      if (this.sharedElements) {
        this.setPrefixedProperty(this.sharedElements.from, 'transformOrigin', '');
        this.sharedElements.from.style.borderRadius = '';
      }
    }
  });
Polymer({

    is: 'scale-down-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;

      if (config.transformOrigin) {
        this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
      }

      var scaleProperty = 'scale(0, 0)';
      if (config.axis === 'x') {
        scaleProperty = 'scale(0, 1)';
      } else if (config.axis === 'y') {
        scaleProperty = 'scale(1, 0)';
      }

      this._effect = new KeyframeEffect(node, [
        {'transform': 'scale(1,1)'},
        {'transform': scaleProperty}
      ], this.timingFromConfig(config));

      return this._effect;
    }

  });
Polymer({

    is: 'scale-up-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;

      if (config.transformOrigin) {
        this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
      }

      var scaleProperty = 'scale(0)';
      if (config.axis === 'x') {
        scaleProperty = 'scale(0, 1)';
      } else if (config.axis === 'y') {
        scaleProperty = 'scale(1, 0)';
      }

      this._effect = new KeyframeEffect(node, [
        {'transform': scaleProperty},
        {'transform': 'scale(1, 1)'}
      ], this.timingFromConfig(config));

      return this._effect;
    }

  });
Polymer({

    is: 'slide-from-left-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;

      if (config.transformOrigin) {
        this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
      } else {
        this.setPrefixedProperty(node, 'transformOrigin', '0 50%');
      }

      this._effect = new KeyframeEffect(node, [
        {'transform': 'translateX(-100%)'},
        {'transform': 'none'}
      ], this.timingFromConfig(config));

      return this._effect;
    }

  });
Polymer({

    is: 'slide-from-right-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;

      if (config.transformOrigin) {
        this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
      } else {
        this.setPrefixedProperty(node, 'transformOrigin', '0 50%');
      }

      this._effect = new KeyframeEffect(node, [
        {'transform': 'translateX(100%)'},
        {'transform': 'none'}
      ], this.timingFromConfig(config));

      return this._effect;
    }

  });
Polymer({

    is: 'slide-left-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;

      if (config.transformOrigin) {
        this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
      } else {
        this.setPrefixedProperty(node, 'transformOrigin', '0 50%');
      }

      this._effect = new KeyframeEffect(node, [
        {'transform': 'none'},
        {'transform': 'translateX(-100%)'}
      ], this.timingFromConfig(config));

      return this._effect;
    }

  });
Polymer({

    is: 'slide-right-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;

      if (config.transformOrigin) {
        this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
      } else {
        this.setPrefixedProperty(node, 'transformOrigin', '0 50%');
      }

      this._effect = new KeyframeEffect(node, [
        {'transform': 'none'},
        {'transform': 'translateX(100%)'}
      ], this.timingFromConfig(config));

      return this._effect;
    }

  });
Polymer({

    is: 'slide-up-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;

      if (config.transformOrigin) {
        this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
      } else {
        this.setPrefixedProperty(node, 'transformOrigin', '50% 0');
      }

      this._effect = new KeyframeEffect(node, [
        {'transform': 'translate(0)'},
        {'transform': 'translateY(-100%)'}
      ], this.timingFromConfig(config));

      return this._effect;
    }

  });
Polymer({

    is: 'slide-down-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;

      if (config.transformOrigin) {
        this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
      } else {
        this.setPrefixedProperty(node, 'transformOrigin', '50% 0');
      }

      this._effect = new KeyframeEffect(node, [
        {'transform': 'translateY(-100%)'},
        {'transform': 'none'}
      ], this.timingFromConfig(config));

      return this._effect;
    }

  });
Polymer({

    is: 'transform-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    /**
     * @param {{
     *   node: !Element,
     *   transformOrigin: (string|undefined),
     *   transformFrom: (string|undefined),
     *   transformTo: (string|undefined),
     *   timing: (Object|undefined)
     * }} config
     */
    configure: function(config) {
      var node = config.node;
      var transformFrom = config.transformFrom || 'none';
      var transformTo = config.transformTo || 'none';

      if (config.transformOrigin) {
        this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
      }

      this._effect = new KeyframeEffect(node, [
        {'transform': transformFrom},
        {'transform': transformTo}
      ], this.timingFromConfig(config));

      return this._effect;
    }

  });
/**
   * Use `Polymer.IronCheckedElementBehavior` to implement a custom element
   * that has a `checked` property, which can be used for validation if the
   * element is also `required`. Element instances implementing this behavior
   * will also be registered for use in an `iron-form` element.
   *
   * @demo demo/index.html
   * @polymerBehavior Polymer.IronCheckedElementBehavior
   */
  Polymer.IronCheckedElementBehaviorImpl = {

    properties: {
      /**
       * Fired when the checked state changes.
       *
       * @event iron-change
       */

      /**
       * Gets or sets the state, `true` is checked and `false` is unchecked.
       */
      checked: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        notify: true,
        observer: '_checkedChanged'
      },

      /**
       * If true, the button toggles the active state with each tap or press
       * of the spacebar.
       */
      toggles: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },

      /* Overriden from Polymer.IronFormElementBehavior */
      value: {
        type: String,
        value: 'on',
        observer: '_valueChanged'
      }
    },

    observers: [
      '_requiredChanged(required)'
    ],

    created: function() {
      // Used by `iron-form` to handle the case that an element with this behavior
      // doesn't have a role of 'checkbox' or 'radio', but should still only be
      // included when the form is serialized if `this.checked === true`.
      this._hasIronCheckedElementBehavior = true;
    },

    /**
     * Returns false if the element is required and not checked, and true otherwise.
     * @param {*=} _value Ignored.
     * @return {boolean} true if `required` is false or if `checked` is true.
     */
    _getValidity: function(_value) {
      return this.disabled || !this.required || this.checked;
    },

    /**
     * Update the aria-required label when `required` is changed.
     */
    _requiredChanged: function() {
      if (this.required) {
        this.setAttribute('aria-required', 'true');
      } else {
        this.removeAttribute('aria-required');
      }
    },

    /**
     * Fire `iron-changed` when the checked state changes.
     */
    _checkedChanged: function() {
      this.active = this.checked;
      this.fire('iron-change');
    },

    /**
     * Reset value to 'on' if it is set to `undefined`.
     */
    _valueChanged: function() {
      if (this.value === undefined || this.value === null) {
        this.value = 'on';
      }
    }
  };

  /** @polymerBehavior Polymer.IronCheckedElementBehavior */
  Polymer.IronCheckedElementBehavior = [
    Polymer.IronFormElementBehavior,
    Polymer.IronValidatableBehavior,
    Polymer.IronCheckedElementBehaviorImpl
  ];
(function() {
    'use strict';

    /**
     * Chrome uses an older version of DOM Level 3 Keyboard Events
     *
     * Most keys are labeled as text, but some are Unicode codepoints.
     * Values taken from: http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/keyset.html#KeySet-Set
     */
    var KEY_IDENTIFIER = {
      'U+0008': 'backspace',
      'U+0009': 'tab',
      'U+001B': 'esc',
      'U+0020': 'space',
      'U+007F': 'del'
    };

    /**
     * Special table for KeyboardEvent.keyCode.
     * KeyboardEvent.keyIdentifier is better, and KeyBoardEvent.key is even better
     * than that.
     *
     * Values from: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Value_of_keyCode
     */
    var KEY_CODE = {
      8: 'backspace',
      9: 'tab',
      13: 'enter',
      27: 'esc',
      33: 'pageup',
      34: 'pagedown',
      35: 'end',
      36: 'home',
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      46: 'del',
      106: '*'
    };

    /**
     * MODIFIER_KEYS maps the short name for modifier keys used in a key
     * combo string to the property name that references those same keys
     * in a KeyboardEvent instance.
     */
    var MODIFIER_KEYS = {
      'shift': 'shiftKey',
      'ctrl': 'ctrlKey',
      'alt': 'altKey',
      'meta': 'metaKey'
    };

    /**
     * KeyboardEvent.key is mostly represented by printable character made by
     * the keyboard, with unprintable keys labeled nicely.
     *
     * However, on OS X, Alt+char can make a Unicode character that follows an
     * Apple-specific mapping. In this case, we fall back to .keyCode.
     */
    var KEY_CHAR = /[a-z0-9*]/;

    /**
     * Matches a keyIdentifier string.
     */
    var IDENT_CHAR = /U\+/;

    /**
     * Matches arrow keys in Gecko 27.0+
     */
    var ARROW_KEY = /^arrow/;

    /**
     * Matches space keys everywhere (notably including IE10's exceptional name
     * `spacebar`).
     */
    var SPACE_KEY = /^space(bar)?/;

    /**
     * Matches ESC key.
     *
     * Value from: http://w3c.github.io/uievents-key/#key-Escape
     */
    var ESC_KEY = /^escape$/;

    /**
     * Transforms the key.
     * @param {string} key The KeyBoardEvent.key
     * @param {Boolean} [noSpecialChars] Limits the transformation to
     * alpha-numeric characters.
     */
    function transformKey(key, noSpecialChars) {
      var validKey = '';
      if (key) {
        var lKey = key.toLowerCase();
        if (lKey === ' ' || SPACE_KEY.test(lKey)) {
          validKey = 'space';
        } else if (ESC_KEY.test(lKey)) {
          validKey = 'esc';
        } else if (lKey.length == 1) {
          if (!noSpecialChars || KEY_CHAR.test(lKey)) {
            validKey = lKey;
          }
        } else if (ARROW_KEY.test(lKey)) {
          validKey = lKey.replace('arrow', '');
        } else if (lKey == 'multiply') {
          // numpad '*' can map to Multiply on IE/Windows
          validKey = '*';
        } else {
          validKey = lKey;
        }
      }
      return validKey;
    }

    function transformKeyIdentifier(keyIdent) {
      var validKey = '';
      if (keyIdent) {
        if (keyIdent in KEY_IDENTIFIER) {
          validKey = KEY_IDENTIFIER[keyIdent];
        } else if (IDENT_CHAR.test(keyIdent)) {
          keyIdent = parseInt(keyIdent.replace('U+', '0x'), 16);
          validKey = String.fromCharCode(keyIdent).toLowerCase();
        } else {
          validKey = keyIdent.toLowerCase();
        }
      }
      return validKey;
    }

    function transformKeyCode(keyCode) {
      var validKey = '';
      if (Number(keyCode)) {
        if (keyCode >= 65 && keyCode <= 90) {
          // ascii a-z
          // lowercase is 32 offset from uppercase
          validKey = String.fromCharCode(32 + keyCode);
        } else if (keyCode >= 112 && keyCode <= 123) {
          // function keys f1-f12
          validKey = 'f' + (keyCode - 112);
        } else if (keyCode >= 48 && keyCode <= 57) {
          // top 0-9 keys
          validKey = String(keyCode - 48);
        } else if (keyCode >= 96 && keyCode <= 105) {
          // num pad 0-9
          validKey = String(keyCode - 96);
        } else {
          validKey = KEY_CODE[keyCode];
        }
      }
      return validKey;
    }

    /**
      * Calculates the normalized key for a KeyboardEvent.
      * @param {KeyboardEvent} keyEvent
      * @param {Boolean} [noSpecialChars] Set to true to limit keyEvent.key
      * transformation to alpha-numeric chars. This is useful with key
      * combinations like shift + 2, which on FF for MacOS produces
      * keyEvent.key = @
      * To get 2 returned, set noSpecialChars = true
      * To get @ returned, set noSpecialChars = false
     */
    function normalizedKeyForEvent(keyEvent, noSpecialChars) {
      // Fall back from .key, to .keyIdentifier, to .keyCode, and then to
      // .detail.key to support artificial keyboard events.
      return transformKey(keyEvent.key, noSpecialChars) ||
        transformKeyIdentifier(keyEvent.keyIdentifier) ||
        transformKeyCode(keyEvent.keyCode) ||
        transformKey(keyEvent.detail ? keyEvent.detail.key : keyEvent.detail, noSpecialChars) || '';
    }

    function keyComboMatchesEvent(keyCombo, event) {
      // For combos with modifiers we support only alpha-numeric keys
      var keyEvent = normalizedKeyForEvent(event, keyCombo.hasModifiers);
      return keyEvent === keyCombo.key &&
        (!keyCombo.hasModifiers || (
          !!event.shiftKey === !!keyCombo.shiftKey &&
          !!event.ctrlKey === !!keyCombo.ctrlKey &&
          !!event.altKey === !!keyCombo.altKey &&
          !!event.metaKey === !!keyCombo.metaKey)
        );
    }

    function parseKeyComboString(keyComboString) {
      if (keyComboString.length === 1) {
        return {
          combo: keyComboString,
          key: keyComboString,
          event: 'keydown'
        };
      }
      return keyComboString.split('+').reduce(function(parsedKeyCombo, keyComboPart) {
        var eventParts = keyComboPart.split(':');
        var keyName = eventParts[0];
        var event = eventParts[1];

        if (keyName in MODIFIER_KEYS) {
          parsedKeyCombo[MODIFIER_KEYS[keyName]] = true;
          parsedKeyCombo.hasModifiers = true;
        } else {
          parsedKeyCombo.key = keyName;
          parsedKeyCombo.event = event || 'keydown';
        }

        return parsedKeyCombo;
      }, {
        combo: keyComboString.split(':').shift()
      });
    }

    function parseEventString(eventString) {
      return eventString.trim().split(' ').map(function(keyComboString) {
        return parseKeyComboString(keyComboString);
      });
    }

    /**
     * `Polymer.IronA11yKeysBehavior` provides a normalized interface for processing
     * keyboard commands that pertain to [WAI-ARIA best practices](http://www.w3.org/TR/wai-aria-practices/#kbd_general_binding).
     * The element takes care of browser differences with respect to Keyboard events
     * and uses an expressive syntax to filter key presses.
     *
     * Use the `keyBindings` prototype property to express what combination of keys
     * will trigger the callback. A key binding has the format
     * `"KEY+MODIFIER:EVENT": "callback"` (`"KEY": "callback"` or
     * `"KEY:EVENT": "callback"` are valid as well). Some examples:
     *
     *      keyBindings: {
     *        'space': '_onKeydown', // same as 'space:keydown'
     *        'shift+tab': '_onKeydown',
     *        'enter:keypress': '_onKeypress',
     *        'esc:keyup': '_onKeyup'
     *      }
     *
     * The callback will receive with an event containing the following information in `event.detail`:
     *
     *      _onKeydown: function(event) {
     *        console.log(event.detail.combo); // KEY+MODIFIER, e.g. "shift+tab"
     *        console.log(event.detail.key); // KEY only, e.g. "tab"
     *        console.log(event.detail.event); // EVENT, e.g. "keydown"
     *        console.log(event.detail.keyboardEvent); // the original KeyboardEvent
     *      }
     *
     * Use the `keyEventTarget` attribute to set up event handlers on a specific
     * node.
     *
     * See the [demo source code](https://github.com/PolymerElements/iron-a11y-keys-behavior/blob/master/demo/x-key-aware.html)
     * for an example.
     *
     * @demo demo/index.html
     * @polymerBehavior
     */
    Polymer.IronA11yKeysBehavior = {
      properties: {
        /**
         * The EventTarget that will be firing relevant KeyboardEvents. Set it to
         * `null` to disable the listeners.
         * @type {?EventTarget}
         */
        keyEventTarget: {
          type: Object,
          value: function() {
            return this;
          }
        },

        /**
         * If true, this property will cause the implementing element to
         * automatically stop propagation on any handled KeyboardEvents.
         */
        stopKeyboardEventPropagation: {
          type: Boolean,
          value: false
        },

        _boundKeyHandlers: {
          type: Array,
          value: function() {
            return [];
          }
        },

        // We use this due to a limitation in IE10 where instances will have
        // own properties of everything on the "prototype".
        _imperativeKeyBindings: {
          type: Object,
          value: function() {
            return {};
          }
        }
      },

      observers: [
        '_resetKeyEventListeners(keyEventTarget, _boundKeyHandlers)'
      ],


      /**
       * To be used to express what combination of keys  will trigger the relative
       * callback. e.g. `keyBindings: { 'esc': '_onEscPressed'}`
       * @type {Object}
       */
      keyBindings: {},

      registered: function() {
        this._prepKeyBindings();
      },

      attached: function() {
        this._listenKeyEventListeners();
      },

      detached: function() {
        this._unlistenKeyEventListeners();
      },

      /**
       * Can be used to imperatively add a key binding to the implementing
       * element. This is the imperative equivalent of declaring a keybinding
       * in the `keyBindings` prototype property.
       */
      addOwnKeyBinding: function(eventString, handlerName) {
        this._imperativeKeyBindings[eventString] = handlerName;
        this._prepKeyBindings();
        this._resetKeyEventListeners();
      },

      /**
       * When called, will remove all imperatively-added key bindings.
       */
      removeOwnKeyBindings: function() {
        this._imperativeKeyBindings = {};
        this._prepKeyBindings();
        this._resetKeyEventListeners();
      },

      /**
       * Returns true if a keyboard event matches `eventString`.
       *
       * @param {KeyboardEvent} event
       * @param {string} eventString
       * @return {boolean}
       */
      keyboardEventMatchesKeys: function(event, eventString) {
        var keyCombos = parseEventString(eventString);
        for (var i = 0; i < keyCombos.length; ++i) {
          if (keyComboMatchesEvent(keyCombos[i], event)) {
            return true;
          }
        }
        return false;
      },

      _collectKeyBindings: function() {
        var keyBindings = this.behaviors.map(function(behavior) {
          return behavior.keyBindings;
        });

        if (keyBindings.indexOf(this.keyBindings) === -1) {
          keyBindings.push(this.keyBindings);
        }

        return keyBindings;
      },

      _prepKeyBindings: function() {
        this._keyBindings = {};

        this._collectKeyBindings().forEach(function(keyBindings) {
          for (var eventString in keyBindings) {
            this._addKeyBinding(eventString, keyBindings[eventString]);
          }
        }, this);

        for (var eventString in this._imperativeKeyBindings) {
          this._addKeyBinding(eventString, this._imperativeKeyBindings[eventString]);
        }

        // Give precedence to combos with modifiers to be checked first.
        for (var eventName in this._keyBindings) {
          this._keyBindings[eventName].sort(function (kb1, kb2) {
            var b1 = kb1[0].hasModifiers;
            var b2 = kb2[0].hasModifiers;
            return (b1 === b2) ? 0 : b1 ? -1 : 1;
          })
        }
      },

      _addKeyBinding: function(eventString, handlerName) {
        parseEventString(eventString).forEach(function(keyCombo) {
          this._keyBindings[keyCombo.event] =
            this._keyBindings[keyCombo.event] || [];

          this._keyBindings[keyCombo.event].push([
            keyCombo,
            handlerName
          ]);
        }, this);
      },

      _resetKeyEventListeners: function() {
        this._unlistenKeyEventListeners();

        if (this.isAttached) {
          this._listenKeyEventListeners();
        }
      },

      _listenKeyEventListeners: function() {
        if (!this.keyEventTarget) {
          return;
        }
        Object.keys(this._keyBindings).forEach(function(eventName) {
          var keyBindings = this._keyBindings[eventName];
          var boundKeyHandler = this._onKeyBindingEvent.bind(this, keyBindings);

          this._boundKeyHandlers.push([this.keyEventTarget, eventName, boundKeyHandler]);

          this.keyEventTarget.addEventListener(eventName, boundKeyHandler);
        }, this);
      },

      _unlistenKeyEventListeners: function() {
        var keyHandlerTuple;
        var keyEventTarget;
        var eventName;
        var boundKeyHandler;

        while (this._boundKeyHandlers.length) {
          // My kingdom for block-scope binding and destructuring assignment..
          keyHandlerTuple = this._boundKeyHandlers.pop();
          keyEventTarget = keyHandlerTuple[0];
          eventName = keyHandlerTuple[1];
          boundKeyHandler = keyHandlerTuple[2];

          keyEventTarget.removeEventListener(eventName, boundKeyHandler);
        }
      },

      _onKeyBindingEvent: function(keyBindings, event) {
        if (this.stopKeyboardEventPropagation) {
          event.stopPropagation();
        }

        // if event has been already prevented, don't do anything
        if (event.defaultPrevented) {
          return;
        }

        for (var i = 0; i < keyBindings.length; i++) {
          var keyCombo = keyBindings[i][0];
          var handlerName = keyBindings[i][1];
          if (keyComboMatchesEvent(keyCombo, event)) {
            this._triggerKeyHandler(keyCombo, handlerName, event);
            // exit the loop if eventDefault was prevented
            if (event.defaultPrevented) {
              return;
            }
          }
        }
      },

      _triggerKeyHandler: function(keyCombo, handlerName, keyboardEvent) {
        var detail = Object.create(keyCombo);
        detail.keyboardEvent = keyboardEvent;
        var event = new CustomEvent(keyCombo.event, {
          detail: detail,
          cancelable: true
        });
        this[handlerName].call(this, event);
        if (event.defaultPrevented) {
          keyboardEvent.preventDefault();
        }
      }
    };
  })();
/**
   * @demo demo/index.html
   * @polymerBehavior Polymer.IronButtonState
   */
  Polymer.IronButtonStateImpl = {

    properties: {

      /**
       * If true, the user is currently holding down the button.
       */
      pressed: {
        type: Boolean,
        readOnly: true,
        value: false,
        reflectToAttribute: true,
        observer: '_pressedChanged'
      },

      /**
       * If true, the button toggles the active state with each tap or press
       * of the spacebar.
       */
      toggles: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /**
       * If true, the button is a toggle and is currently in the active state.
       */
      active: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true
      },

      /**
       * True if the element is currently being pressed by a "pointer," which
       * is loosely defined as mouse or touch input (but specifically excluding
       * keyboard input).
       */
      pointerDown: {
        type: Boolean,
        readOnly: true,
        value: false
      },

      /**
       * True if the input device that caused the element to receive focus
       * was a keyboard.
       */
      receivedFocusFromKeyboard: {
        type: Boolean,
        readOnly: true
      },

      /**
       * The aria attribute to be set if the button is a toggle and in the
       * active state.
       */
      ariaActiveAttribute: {
        type: String,
        value: 'aria-pressed',
        observer: '_ariaActiveAttributeChanged'
      }
    },

    listeners: {
      down: '_downHandler',
      up: '_upHandler',
      tap: '_tapHandler'
    },

    observers: [
      '_detectKeyboardFocus(focused)',
      '_activeChanged(active, ariaActiveAttribute)'
    ],

    keyBindings: {
      'enter:keydown': '_asyncClick',
      'space:keydown': '_spaceKeyDownHandler',
      'space:keyup': '_spaceKeyUpHandler',
    },

    _mouseEventRe: /^mouse/,

    _tapHandler: function() {
      if (this.toggles) {
       // a tap is needed to toggle the active state
        this._userActivate(!this.active);
      } else {
        this.active = false;
      }
    },

    _detectKeyboardFocus: function(focused) {
      this._setReceivedFocusFromKeyboard(!this.pointerDown && focused);
    },

    // to emulate native checkbox, (de-)activations from a user interaction fire
    // 'change' events
    _userActivate: function(active) {
      if (this.active !== active) {
        this.active = active;
        this.fire('change');
      }
    },

    _downHandler: function(event) {
      this._setPointerDown(true);
      this._setPressed(true);
      this._setReceivedFocusFromKeyboard(false);
    },

    _upHandler: function() {
      this._setPointerDown(false);
      this._setPressed(false);
    },

    /**
     * @param {!KeyboardEvent} event .
     */
    _spaceKeyDownHandler: function(event) {
      var keyboardEvent = event.detail.keyboardEvent;
      var target = Polymer.dom(keyboardEvent).localTarget;

      // Ignore the event if this is coming from a focused light child, since that
      // element will deal with it.
      if (this.isLightDescendant(/** @type {Node} */(target)))
        return;

      keyboardEvent.preventDefault();
      keyboardEvent.stopImmediatePropagation();
      this._setPressed(true);
    },

    /**
     * @param {!KeyboardEvent} event .
     */
    _spaceKeyUpHandler: function(event) {
      var keyboardEvent = event.detail.keyboardEvent;
      var target = Polymer.dom(keyboardEvent).localTarget;

      // Ignore the event if this is coming from a focused light child, since that
      // element will deal with it.
      if (this.isLightDescendant(/** @type {Node} */(target)))
        return;

      if (this.pressed) {
        this._asyncClick();
      }
      this._setPressed(false);
    },

    // trigger click asynchronously, the asynchrony is useful to allow one
    // event handler to unwind before triggering another event
    _asyncClick: function() {
      this.async(function() {
        this.click();
      }, 1);
    },

    // any of these changes are considered a change to button state

    _pressedChanged: function(pressed) {
      this._changedButtonState();
    },

    _ariaActiveAttributeChanged: function(value, oldValue) {
      if (oldValue && oldValue != value && this.hasAttribute(oldValue)) {
        this.removeAttribute(oldValue);
      }
    },

    _activeChanged: function(active, ariaActiveAttribute) {
      if (this.toggles) {
        this.setAttribute(this.ariaActiveAttribute,
                          active ? 'true' : 'false');
      } else {
        this.removeAttribute(this.ariaActiveAttribute);
      }
      this._changedButtonState();
    },

    _controlStateChanged: function() {
      if (this.disabled) {
        this._setPressed(false);
      } else {
        this._changedButtonState();
      }
    },

    // provide hook for follow-on behaviors to react to button-state

    _changedButtonState: function() {
      if (this._buttonStateChanged) {
        this._buttonStateChanged(); // abstract
      }
    }

  };

  /** @polymerBehavior */
  Polymer.IronButtonState = [
    Polymer.IronA11yKeysBehavior,
    Polymer.IronButtonStateImpl
  ];
(function() {
    var Utility = {
      distance: function(x1, y1, x2, y2) {
        var xDelta = (x1 - x2);
        var yDelta = (y1 - y2);

        return Math.sqrt(xDelta * xDelta + yDelta * yDelta);
      },

      now: window.performance && window.performance.now ?
          window.performance.now.bind(window.performance) : Date.now
    };

    /**
     * @param {HTMLElement} element
     * @constructor
     */
    function ElementMetrics(element) {
      this.element = element;
      this.width = this.boundingRect.width;
      this.height = this.boundingRect.height;

      this.size = Math.max(this.width, this.height);
    }

    ElementMetrics.prototype = {
      get boundingRect () {
        return this.element.getBoundingClientRect();
      },

      furthestCornerDistanceFrom: function(x, y) {
        var topLeft = Utility.distance(x, y, 0, 0);
        var topRight = Utility.distance(x, y, this.width, 0);
        var bottomLeft = Utility.distance(x, y, 0, this.height);
        var bottomRight = Utility.distance(x, y, this.width, this.height);

        return Math.max(topLeft, topRight, bottomLeft, bottomRight);
      }
    };

    /**
     * @param {HTMLElement} element
     * @constructor
     */
    function Ripple(element) {
      this.element = element;
      this.color = window.getComputedStyle(element).color;

      this.wave = document.createElement('div');
      this.waveContainer = document.createElement('div');
      this.wave.style.backgroundColor = this.color;
      this.wave.classList.add('wave');
      this.waveContainer.classList.add('wave-container');
      Polymer.dom(this.waveContainer).appendChild(this.wave);

      this.resetInteractionState();
    }

    Ripple.MAX_RADIUS = 300;

    Ripple.prototype = {
      get recenters() {
        return this.element.recenters;
      },

      get center() {
        return this.element.center;
      },

      get mouseDownElapsed() {
        var elapsed;

        if (!this.mouseDownStart) {
          return 0;
        }

        elapsed = Utility.now() - this.mouseDownStart;

        if (this.mouseUpStart) {
          elapsed -= this.mouseUpElapsed;
        }

        return elapsed;
      },

      get mouseUpElapsed() {
        return this.mouseUpStart ?
          Utility.now () - this.mouseUpStart : 0;
      },

      get mouseDownElapsedSeconds() {
        return this.mouseDownElapsed / 1000;
      },

      get mouseUpElapsedSeconds() {
        return this.mouseUpElapsed / 1000;
      },

      get mouseInteractionSeconds() {
        return this.mouseDownElapsedSeconds + this.mouseUpElapsedSeconds;
      },

      get initialOpacity() {
        return this.element.initialOpacity;
      },

      get opacityDecayVelocity() {
        return this.element.opacityDecayVelocity;
      },

      get radius() {
        var width2 = this.containerMetrics.width * this.containerMetrics.width;
        var height2 = this.containerMetrics.height * this.containerMetrics.height;
        var waveRadius = Math.min(
          Math.sqrt(width2 + height2),
          Ripple.MAX_RADIUS
        ) * 1.1 + 5;

        var duration = 1.1 - 0.2 * (waveRadius / Ripple.MAX_RADIUS);
        var timeNow = this.mouseInteractionSeconds / duration;
        var size = waveRadius * (1 - Math.pow(80, -timeNow));

        return Math.abs(size);
      },

      get opacity() {
        if (!this.mouseUpStart) {
          return this.initialOpacity;
        }

        return Math.max(
          0,
          this.initialOpacity - this.mouseUpElapsedSeconds * this.opacityDecayVelocity
        );
      },

      get outerOpacity() {
        // Linear increase in background opacity, capped at the opacity
        // of the wavefront (waveOpacity).
        var outerOpacity = this.mouseUpElapsedSeconds * 0.3;
        var waveOpacity = this.opacity;

        return Math.max(
          0,
          Math.min(outerOpacity, waveOpacity)
        );
      },

      get isOpacityFullyDecayed() {
        return this.opacity < 0.01 &&
          this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS);
      },

      get isRestingAtMaxRadius() {
        return this.opacity >= this.initialOpacity &&
          this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS);
      },

      get isAnimationComplete() {
        return this.mouseUpStart ?
          this.isOpacityFullyDecayed : this.isRestingAtMaxRadius;
      },

      get translationFraction() {
        return Math.min(
          1,
          this.radius / this.containerMetrics.size * 2 / Math.sqrt(2)
        );
      },

      get xNow() {
        if (this.xEnd) {
          return this.xStart + this.translationFraction * (this.xEnd - this.xStart);
        }

        return this.xStart;
      },

      get yNow() {
        if (this.yEnd) {
          return this.yStart + this.translationFraction * (this.yEnd - this.yStart);
        }

        return this.yStart;
      },

      get isMouseDown() {
        return this.mouseDownStart && !this.mouseUpStart;
      },

      resetInteractionState: function() {
        this.maxRadius = 0;
        this.mouseDownStart = 0;
        this.mouseUpStart = 0;

        this.xStart = 0;
        this.yStart = 0;
        this.xEnd = 0;
        this.yEnd = 0;
        this.slideDistance = 0;

        this.containerMetrics = new ElementMetrics(this.element);
      },

      draw: function() {
        var scale;
        var translateString;
        var dx;
        var dy;

        this.wave.style.opacity = this.opacity;

        scale = this.radius / (this.containerMetrics.size / 2);
        dx = this.xNow - (this.containerMetrics.width / 2);
        dy = this.yNow - (this.containerMetrics.height / 2);


        // 2d transform for safari because of border-radius and overflow:hidden clipping bug.
        // https://bugs.webkit.org/show_bug.cgi?id=98538
        this.waveContainer.style.webkitTransform = 'translate(' + dx + 'px, ' + dy + 'px)';
        this.waveContainer.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0)';
        this.wave.style.webkitTransform = 'scale(' + scale + ',' + scale + ')';
        this.wave.style.transform = 'scale3d(' + scale + ',' + scale + ',1)';
      },

      /** @param {Event=} event */
      downAction: function(event) {
        var xCenter = this.containerMetrics.width / 2;
        var yCenter = this.containerMetrics.height / 2;

        this.resetInteractionState();
        this.mouseDownStart = Utility.now();

        if (this.center) {
          this.xStart = xCenter;
          this.yStart = yCenter;
          this.slideDistance = Utility.distance(
            this.xStart, this.yStart, this.xEnd, this.yEnd
          );
        } else {
          this.xStart = event ?
              event.detail.x - this.containerMetrics.boundingRect.left :
              this.containerMetrics.width / 2;
          this.yStart = event ?
              event.detail.y - this.containerMetrics.boundingRect.top :
              this.containerMetrics.height / 2;
        }

        if (this.recenters) {
          this.xEnd = xCenter;
          this.yEnd = yCenter;
          this.slideDistance = Utility.distance(
            this.xStart, this.yStart, this.xEnd, this.yEnd
          );
        }

        this.maxRadius = this.containerMetrics.furthestCornerDistanceFrom(
          this.xStart,
          this.yStart
        );

        this.waveContainer.style.top =
          (this.containerMetrics.height - this.containerMetrics.size) / 2 + 'px';
        this.waveContainer.style.left =
          (this.containerMetrics.width - this.containerMetrics.size) / 2 + 'px';

        this.waveContainer.style.width = this.containerMetrics.size + 'px';
        this.waveContainer.style.height = this.containerMetrics.size + 'px';
      },

      /** @param {Event=} event */
      upAction: function(event) {
        if (!this.isMouseDown) {
          return;
        }

        this.mouseUpStart = Utility.now();
      },

      remove: function() {
        Polymer.dom(this.waveContainer.parentNode).removeChild(
          this.waveContainer
        );
      }
    };
  })();
/**
   * `Polymer.PaperRippleBehavior` dynamically implements a ripple
   * when the element has focus via pointer or keyboard.
   *
   * NOTE: This behavior is intended to be used in conjunction with and after
   * `Polymer.IronButtonState` and `Polymer.IronControlState`.
   *
   * @polymerBehavior Polymer.PaperRippleBehavior
   */
  Polymer.PaperRippleBehavior = {
    properties: {
      /**
       * If true, the element will not produce a ripple effect when interacted
       * with via the pointer.
       */
      noink: {
        type: Boolean,
        observer: '_noinkChanged'
      },

      /**
       * @type {Element|undefined}
       */
      _rippleContainer: {
        type: Object,
      }
    },

    /**
     * Ensures a `<paper-ripple>` element is available when the element is
     * focused.
     */
    _buttonStateChanged: function() {
      if (this.focused) {
        this.ensureRipple();
      }
    },

    /**
     * In addition to the functionality provided in `IronButtonState`, ensures
     * a ripple effect is created when the element is in a `pressed` state.
     */
    _downHandler: function(event) {
      Polymer.IronButtonStateImpl._downHandler.call(this, event);
      if (this.pressed) {
        this.ensureRipple(event);
      }
    },

    /**
     * Ensures this element contains a ripple effect. For startup efficiency
     * the ripple effect is dynamically on demand when needed.
     * @param {!Event=} optTriggeringEvent (optional) event that triggered the
     * ripple.
     */
    ensureRipple: function(optTriggeringEvent) {
      if (!this.hasRipple()) {
        this._ripple = this._createRipple();
        this._ripple.noink = this.noink;
        var rippleContainer = this._rippleContainer || this.root;
        if (rippleContainer) {
          Polymer.dom(rippleContainer).appendChild(this._ripple);
        }
        if (optTriggeringEvent) {
          // Check if the event happened inside of the ripple container
          // Fall back to host instead of the root because distributed text
          // nodes are not valid event targets
          var domContainer = Polymer.dom(this._rippleContainer || this);
          var target = Polymer.dom(optTriggeringEvent).rootTarget;
          if (domContainer.deepContains( /** @type {Node} */(target))) {
            this._ripple.uiDownAction(optTriggeringEvent);
          }
        }
      }
    },

    /**
     * Returns the `<paper-ripple>` element used by this element to create
     * ripple effects. The element's ripple is created on demand, when
     * necessary, and calling this method will force the
     * ripple to be created.
     */
    getRipple: function() {
      this.ensureRipple();
      return this._ripple;
    },

    /**
     * Returns true if this element currently contains a ripple effect.
     * @return {boolean}
     */
    hasRipple: function() {
      return Boolean(this._ripple);
    },

    /**
     * Create the element's ripple effect via creating a `<paper-ripple>`.
     * Override this method to customize the ripple element.
     * @return {!PaperRippleElement} Returns a `<paper-ripple>` element.
     */
    _createRipple: function() {
      return /** @type {!PaperRippleElement} */ (
          document.createElement('paper-ripple'));
    },

    _noinkChanged: function(noink) {
      if (this.hasRipple()) {
        this._ripple.noink = noink;
      }
    }
  };
/**
   * `Polymer.PaperInkyFocusBehavior` implements a ripple when the element has keyboard focus.
   *
   * @polymerBehavior Polymer.PaperInkyFocusBehavior
   */
  Polymer.PaperInkyFocusBehaviorImpl = {
    observers: [
      '_focusedChanged(receivedFocusFromKeyboard)'
    ],

    _focusedChanged: function(receivedFocusFromKeyboard) {
      if (receivedFocusFromKeyboard) {
        this.ensureRipple();
      }
      if (this.hasRipple()) {
        this._ripple.holdDown = receivedFocusFromKeyboard;
      }
    },

    _createRipple: function() {
      var ripple = Polymer.PaperRippleBehavior._createRipple();
      ripple.id = 'ink';
      ripple.setAttribute('center', '');
      ripple.classList.add('circle');
      return ripple;
    }
  };

  /** @polymerBehavior Polymer.PaperInkyFocusBehavior */
  Polymer.PaperInkyFocusBehavior = [
    Polymer.IronButtonState,
    Polymer.IronControlState,
    Polymer.PaperRippleBehavior,
    Polymer.PaperInkyFocusBehaviorImpl
  ];
/**
   * Use `Polymer.PaperCheckedElementBehavior` to implement a custom element
   * that has a `checked` property similar to `Polymer.IronCheckedElementBehavior`
   * and is compatible with having a ripple effect.
   * @polymerBehavior Polymer.PaperCheckedElementBehavior
   */
  Polymer.PaperCheckedElementBehaviorImpl = {
    /**
     * Synchronizes the element's checked state with its ripple effect.
     */
    _checkedChanged: function() {
      Polymer.IronCheckedElementBehaviorImpl._checkedChanged.call(this);
      if (this.hasRipple()) {
        if (this.checked) {
          this._ripple.setAttribute('checked', '');
        } else {
          this._ripple.removeAttribute('checked');
        }
      }
    },

    /**
     * Synchronizes the element's `active` and `checked` state.
     */
    _buttonStateChanged: function() {
      Polymer.PaperRippleBehavior._buttonStateChanged.call(this);
      if (this.disabled) {
        return;
      }
      if (this.isAttached) {
        this.checked = this.active;
      }
    }
  };

  /** @polymerBehavior Polymer.PaperCheckedElementBehavior */
  Polymer.PaperCheckedElementBehavior = [
    Polymer.PaperInkyFocusBehavior,
    Polymer.IronCheckedElementBehavior,
    Polymer.PaperCheckedElementBehaviorImpl
  ];
Polymer({
      is: 'paper-checkbox',

      behaviors: [
        Polymer.PaperCheckedElementBehavior
      ],

      hostAttributes: {
        role: 'checkbox',
        'aria-checked': false,
        tabindex: 0
      },

      properties: {
        /**
         * Fired when the checked state changes due to user interaction.
         *
         * @event change
         */

        /**
         * Fired when the checked state changes.
         *
         * @event iron-change
         */
        ariaActiveAttribute: {
          type: String,
          value: 'aria-checked'
        }
      },

      attached: function() {
        var inkSize = this.getComputedStyleValue('--calculated-paper-checkbox-ink-size');
        // If unset, compute and set the default `--paper-checkbox-ink-size`.
        if (inkSize === '-1px') {
          var checkboxSize = parseFloat(this.getComputedStyleValue('--calculated-paper-checkbox-size'));
          var defaultInkSize = Math.floor((8 / 3) * checkboxSize);

          // The checkbox and ripple need to have the same parity so that their
          // centers align.
          if (defaultInkSize % 2 !== checkboxSize % 2) {
            defaultInkSize++;
          }

          this.customStyle['--paper-checkbox-ink-size'] = defaultInkSize + 'px';
          this.updateStyles();
        }
      },

      _computeCheckboxClass: function(checked, invalid) {
        var className = '';
        if (checked) {
          className += 'checked ';
        }
        if (invalid) {
          className += 'invalid';
        }
        return className;
      },

      _computeCheckmarkClass: function(checked) {
        return checked ? '' : 'hidden';
      },

      // create ripple inside the checkboxContainer
      _createRipple: function() {
        this._rippleContainer = this.$.checkboxContainer;
        return Polymer.PaperInkyFocusBehaviorImpl._createRipple.call(this);
      }

    });
/**
 * `iron-range-behavior` provides the behavior for something with a minimum to maximum range.
 *
 * @demo demo/index.html
 * @polymerBehavior
 */
 Polymer.IronRangeBehavior = {

  properties: {

    /**
     * The number that represents the current value.
     */
    value: {
      type: Number,
      value: 0,
      notify: true,
      reflectToAttribute: true
    },

    /**
     * The number that indicates the minimum value of the range.
     */
    min: {
      type: Number,
      value: 0,
      notify: true
    },

    /**
     * The number that indicates the maximum value of the range.
     */
    max: {
      type: Number,
      value: 100,
      notify: true
    },

    /**
     * Specifies the value granularity of the range's value.
     */
    step: {
      type: Number,
      value: 1,
      notify: true
    },

    /**
     * Returns the ratio of the value.
     */
    ratio: {
      type: Number,
      value: 0,
      readOnly: true,
      notify: true
    },
  },

  observers: [
    '_update(value, min, max, step)'
  ],

  _calcRatio: function(value) {
    return (this._clampValue(value) - this.min) / (this.max - this.min);
  },

  _clampValue: function(value) {
    return Math.min(this.max, Math.max(this.min, this._calcStep(value)));
  },

  _calcStep: function(value) {
    // polymer/issues/2493
    value = parseFloat(value);

    if (!this.step) {
      return value;
    }

    var numSteps = Math.round((value - this.min) / this.step);
    if (this.step < 1) {
     /**
      * For small values of this.step, if we calculate the step using
      * `Math.round(value / step) * step` we may hit a precision point issue
      * eg. 0.1 * 0.2 =  0.020000000000000004
      * http://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
      *
      * as a work around we can divide by the reciprocal of `step`
      */
      return numSteps / (1 / this.step) + this.min;
    } else {
      return numSteps * this.step + this.min;
    }
  },

  _validateValue: function() {
    var v = this._clampValue(this.value);
    this.value = this.oldValue = isNaN(v) ? this.oldValue : v;
    return this.value !== v;
  },

  _update: function() {
    this._validateValue();
    this._setRatio(this._calcRatio(this.value) * 100);
  }

};
(function() {
      'use strict';

      Polymer.IronA11yAnnouncer = Polymer({
        is: 'iron-a11y-announcer',

        properties: {

          /**
           * The value of mode is used to set the `aria-live` attribute
           * for the element that will be announced. Valid values are: `off`,
           * `polite` and `assertive`.
           */
          mode: {
            type: String,
            value: 'polite'
          },

          _text: {
            type: String,
            value: ''
          }
        },

        created: function() {
          if (!Polymer.IronA11yAnnouncer.instance) {
            Polymer.IronA11yAnnouncer.instance = this;
          }

          document.body.addEventListener('iron-announce', this._onIronAnnounce.bind(this));
        },

        /**
         * Cause a text string to be announced by screen readers.
         *
         * @param {string} text The text that should be announced.
         */
        announce: function(text) {
          this._text = '';
          this.async(function() {
            this._text = text;
          }, 100);
        },

        _onIronAnnounce: function(event) {
          if (event.detail && event.detail.text) {
            this.announce(event.detail.text);
          }
        }
      });

      Polymer.IronA11yAnnouncer.instance = null;

      Polymer.IronA11yAnnouncer.requestAvailability = function() {
        if (!Polymer.IronA11yAnnouncer.instance) {
          Polymer.IronA11yAnnouncer.instance = document.createElement('iron-a11y-announcer');
        }

        document.body.appendChild(Polymer.IronA11yAnnouncer.instance);
      };
    })();
/*
`<iron-input>` adds two-way binding and custom validators using `Polymer.IronValidatorBehavior`
to `<input>`.

### Two-way binding

By default you can only get notified of changes to an `input`'s `value` due to user input:

    <input value="{{myValue::input}}">

`iron-input` adds the `bind-value` property that mirrors the `value` property, and can be used
for two-way data binding. `bind-value` will notify if it is changed either by user input or by script.

    <input is="iron-input" bind-value="{{myValue}}">

### Custom validators

You can use custom validators that implement `Polymer.IronValidatorBehavior` with `<iron-input>`.

    <input is="iron-input" validator="my-custom-validator">

### Stopping invalid input

It may be desirable to only allow users to enter certain characters. You can use the
`prevent-invalid-input` and `allowed-pattern` attributes together to accomplish this. This feature
is separate from validation, and `allowed-pattern` does not affect how the input is validated.

    <!-- only allow characters that match [0-9] -->
    <input is="iron-input" prevent-invalid-input allowed-pattern="[0-9]">

@hero hero.svg
@demo demo/index.html
*/

  Polymer({

    is: 'iron-input',

    extends: 'input',

    behaviors: [
      Polymer.IronValidatableBehavior
    ],

    properties: {

      /**
       * Use this property instead of `value` for two-way data binding.
       */
      bindValue: {
        observer: '_bindValueChanged',
        type: String
      },

      /**
       * Set to true to prevent the user from entering invalid input. If `allowedPattern` is set,
       * any character typed by the user will be matched against that pattern, and rejected if it's not a match.
       * Pasted input will have each character checked individually; if any character
       * doesn't match `allowedPattern`, the entire pasted string will be rejected.
       * If `allowedPattern` is not set, it will use the `type` attribute (only supported for `type=number`).
       */
      preventInvalidInput: {
        type: Boolean
      },

      /**
       * Regular expression that list the characters allowed as input.
       * This pattern represents the allowed characters for the field; as the user inputs text,
       * each individual character will be checked against the pattern (rather than checking
       * the entire value as a whole). The recommended format should be a list of allowed characters;
       * for example, `[a-zA-Z0-9.+-!;:]`
       */
      allowedPattern: {
        type: String,
        observer: "_allowedPatternChanged"
      },

      _previousValidInput: {
        type: String,
        value: ''
      },

      _patternAlreadyChecked: {
        type: Boolean,
        value: false
      }

    },

    listeners: {
      'input': '_onInput',
      'keypress': '_onKeypress'
    },

    /** @suppress {checkTypes} */
    registered: function() {
      // Feature detect whether we need to patch dispatchEvent (i.e. on FF and IE).
      if (!this._canDispatchEventOnDisabled()) {
        this._origDispatchEvent = this.dispatchEvent;
        this.dispatchEvent = this._dispatchEventFirefoxIE;
      }
    },

    created: function() {
      Polymer.IronA11yAnnouncer.requestAvailability();
    },

    _canDispatchEventOnDisabled: function() {
      var input = document.createElement('input');
      var canDispatch = false;
      input.disabled = true;

      input.addEventListener('feature-check-dispatch-event', function() {
        canDispatch = true;
      });

      try {
        input.dispatchEvent(new Event('feature-check-dispatch-event'));
      } catch(e) {}

      return canDispatch;
    },

    _dispatchEventFirefoxIE: function() {
      // Due to Firefox bug, events fired on disabled form controls can throw
      // errors; furthermore, neither IE nor Firefox will actually dispatch
      // events from disabled form controls; as such, we toggle disable around
      // the dispatch to allow notifying properties to notify
      // See issue #47 for details
      var disabled = this.disabled;
      this.disabled = false;
      this._origDispatchEvent.apply(this, arguments);
      this.disabled = disabled;
    },

    get _patternRegExp() {
      var pattern;
      if (this.allowedPattern) {
        pattern = new RegExp(this.allowedPattern);
      } else {
        switch (this.type) {
          case 'number':
            pattern = /[0-9.,e-]/;
            break;
        }
      }
      return pattern;
    },

    ready: function() {
      this.bindValue = this.value;
    },

    /**
     * @suppress {checkTypes}
     */
    _bindValueChanged: function() {
      if (this.value !== this.bindValue) {
        this.value = !(this.bindValue || this.bindValue === 0 || this.bindValue === false) ? '' : this.bindValue;
      }
      // manually notify because we don't want to notify until after setting value
      this.fire('bind-value-changed', {value: this.bindValue});
    },

    _allowedPatternChanged: function() {
      // Force to prevent invalid input when an `allowed-pattern` is set
      this.preventInvalidInput = this.allowedPattern ? true : false;
    },

    _onInput: function() {
      // Need to validate each of the characters pasted if they haven't
      // been validated inside `_onKeypress` already.
      if (this.preventInvalidInput && !this._patternAlreadyChecked) {
        var valid = this._checkPatternValidity();
        if (!valid) {
          this._announceInvalidCharacter('Invalid string of characters not entered.');
          this.value = this._previousValidInput;
        }
      }

      this.bindValue = this.value;
      this._previousValidInput = this.value;
      this._patternAlreadyChecked = false;
    },

    _isPrintable: function(event) {
      // What a control/printable character is varies wildly based on the browser.
      // - most control characters (arrows, backspace) do not send a `keypress` event
      //   in Chrome, but the *do* on Firefox
      // - in Firefox, when they do send a `keypress` event, control chars have
      //   a charCode = 0, keyCode = xx (for ex. 40 for down arrow)
      // - printable characters always send a keypress event.
      // - in Firefox, printable chars always have a keyCode = 0. In Chrome, the keyCode
      //   always matches the charCode.
      // None of this makes any sense.

      // For these keys, ASCII code == browser keycode.
      var anyNonPrintable =
        (event.keyCode == 8)   ||  // backspace
        (event.keyCode == 9)   ||  // tab
        (event.keyCode == 13)  ||  // enter
        (event.keyCode == 27);     // escape

      // For these keys, make sure it's a browser keycode and not an ASCII code.
      var mozNonPrintable =
        (event.keyCode == 19)  ||  // pause
        (event.keyCode == 20)  ||  // caps lock
        (event.keyCode == 45)  ||  // insert
        (event.keyCode == 46)  ||  // delete
        (event.keyCode == 144) ||  // num lock
        (event.keyCode == 145) ||  // scroll lock
        (event.keyCode > 32 && event.keyCode < 41)   || // page up/down, end, home, arrows
        (event.keyCode > 111 && event.keyCode < 124); // fn keys

      return !anyNonPrintable && !(event.charCode == 0 && mozNonPrintable);
    },

    _onKeypress: function(event) {
      if (!this.preventInvalidInput && this.type !== 'number') {
        return;
      }
      var regexp = this._patternRegExp;
      if (!regexp) {
        return;
      }

      // Handle special keys and backspace
      if (event.metaKey || event.ctrlKey || event.altKey)
        return;

      // Check the pattern either here or in `_onInput`, but not in both.
      this._patternAlreadyChecked = true;

      var thisChar = String.fromCharCode(event.charCode);
      if (this._isPrintable(event) && !regexp.test(thisChar)) {
        event.preventDefault();
        this._announceInvalidCharacter('Invalid character ' + thisChar + ' not entered.');
      }
    },

    _checkPatternValidity: function() {
      var regexp = this._patternRegExp;
      if (!regexp) {
        return true;
      }
      for (var i = 0; i < this.value.length; i++) {
        if (!regexp.test(this.value[i])) {
          return false;
        }
      }
      return true;
    },

    /**
     * Returns true if `value` is valid. The validator provided in `validator` will be used first,
     * then any constraints.
     * @return {boolean} True if the value is valid.
     */
    validate: function() {
      // First, check what the browser thinks. Some inputs (like type=number)
      // behave weirdly and will set the value to "" if something invalid is
      // entered, but will set the validity correctly.
      var valid =  this.checkValidity();

      // Only do extra checking if the browser thought this was valid.
      if (valid) {
        // Empty, required input is invalid
        if (this.required && this.value === '') {
          valid = false;
        } else if (this.hasValidator()) {
          valid = Polymer.IronValidatableBehavior.validate.call(this, this.value);
        }
      }

      this.invalid = !valid;
      this.fire('iron-input-validate');
      return valid;
    },

    _announceInvalidCharacter: function(message) {
      this.fire('iron-announce', { text: message });
    }
  });

  /*
  The `iron-input-validate` event is fired whenever `validate()` is called.
  @event iron-input-validate
  */
// Generate unique, monotonically increasing IDs for labels (needed by
  // aria-labelledby) and add-ons.
  Polymer.PaperInputHelper = {};
  Polymer.PaperInputHelper.NextLabelID = 1;
  Polymer.PaperInputHelper.NextAddonID = 1;

  /**
   * Use `Polymer.PaperInputBehavior` to implement inputs with `<paper-input-container>`. This
   * behavior is implemented by `<paper-input>`. It exposes a number of properties from
   * `<paper-input-container>` and `<input is="iron-input">` and they should be bound in your
   * template.
   *
   * The input element can be accessed by the `inputElement` property if you need to access
   * properties or methods that are not exposed.
   * @polymerBehavior Polymer.PaperInputBehavior
   */
  Polymer.PaperInputBehaviorImpl = {

    properties: {
      /**
       * Fired when the input changes due to user interaction.
       *
       * @event change
       */

      /**
       * The label for this input. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * `<label>`'s content and `hidden` property, e.g.
       * `<label hidden$="[[!label]]">[[label]]</label>` in your `template`
       */
      label: {
        type: String
      },

      /**
       * The value for this input. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * the `<input is="iron-input">`'s `bindValue`
       * property, or the value property of your input that is `notify:true`.
       */
      value: {
        notify: true,
        type: String
      },

      /**
       * Set to true to disable this input. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * both the `<paper-input-container>`'s and the input's `disabled` property.
       */
      disabled: {
        type: Boolean,
        value: false
      },

      /**
       * Returns true if the value is invalid. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to both the
       * `<paper-input-container>`'s and the input's `invalid` property.
       *
       * If `autoValidate` is true, the `invalid` attribute is managed automatically,
       * which can clobber attempts to manage it manually.
       */
      invalid: {
        type: Boolean,
        value: false,
        notify: true
      },

      /**
       * Set to true to prevent the user from entering invalid input. If you're
       * using PaperInputBehavior to  implement your own paper-input-like element,
       * bind this to `<input is="iron-input">`'s `preventInvalidInput` property.
       */
      preventInvalidInput: {
        type: Boolean
      },

      /**
       * Set this to specify the pattern allowed by `preventInvalidInput`. If
       * you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `allowedPattern`
       * property.
       */
      allowedPattern: {
        type: String
      },

      /**
       * The type of the input. The supported types are `text`, `number` and `password`.
       * If you're using PaperInputBehavior to implement your own paper-input-like element,
       * bind this to the `<input is="iron-input">`'s `type` property.
       */
      type: {
        type: String
      },

      /**
       * The datalist of the input (if any). This should match the id of an existing `<datalist>`.
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `list` property.
       */
      list: {
        type: String
      },

      /**
       * A pattern to validate the `input` with. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * the `<input is="iron-input">`'s `pattern` property.
       */
      pattern: {
        type: String
      },

      /**
       * Set to true to mark the input as required. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * the `<input is="iron-input">`'s `required` property.
       */
      required: {
        type: Boolean,
        value: false
      },

      /**
       * The error message to display when the input is invalid. If you're using
       * PaperInputBehavior to implement your own paper-input-like element,
       * bind this to the `<paper-input-error>`'s content, if using.
       */
      errorMessage: {
        type: String
      },

      /**
       * Set to true to show a character counter.
       */
      charCounter: {
        type: Boolean,
        value: false
      },

      /**
       * Set to true to disable the floating label. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * the `<paper-input-container>`'s `noLabelFloat` property.
       */
      noLabelFloat: {
        type: Boolean,
        value: false
      },

      /**
       * Set to true to always float the label. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * the `<paper-input-container>`'s `alwaysFloatLabel` property.
       */
      alwaysFloatLabel: {
        type: Boolean,
        value: false
      },

      /**
       * Set to true to auto-validate the input value. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * the `<paper-input-container>`'s `autoValidate` property.
       */
      autoValidate: {
        type: Boolean,
        value: false
      },

      /**
       * Name of the validator to use. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * the `<input is="iron-input">`'s `validator` property.
       */
      validator: {
        type: String
      },

      // HTMLInputElement attributes for binding if needed

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `autocomplete` property.
       */
      autocomplete: {
        type: String,
        value: 'off'
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `autofocus` property.
       */
      autofocus: {
        type: Boolean,
        observer: '_autofocusChanged'
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `inputmode` property.
       */
      inputmode: {
        type: String
      },

      /**
       * The minimum length of the input value.
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `minlength` property.
       */
      minlength: {
        type: Number
      },

      /**
       * The maximum length of the input value.
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `maxlength` property.
       */
      maxlength: {
        type: Number
      },

      /**
       * The minimum (numeric or date-time) input value.
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `min` property.
       */
      min: {
        type: String
      },

      /**
       * The maximum (numeric or date-time) input value.
       * Can be a String (e.g. `"2000-1-1"`) or a Number (e.g. `2`).
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `max` property.
       */
      max: {
        type: String
      },

      /**
       * Limits the numeric or date-time increments.
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `step` property.
       */
      step: {
        type: String
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `name` property.
       */
      name: {
        type: String
      },

      /**
       * A placeholder string in addition to the label. If this is set, the label will always float.
       */
      placeholder: {
        type: String,
        // need to set a default so _computeAlwaysFloatLabel is run
        value: ''
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `readonly` property.
       */
      readonly: {
        type: Boolean,
        value: false
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `size` property.
       */
      size: {
        type: Number
      },

      // Nonstandard attributes for binding if needed

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `autocapitalize` property.
       */
      autocapitalize: {
        type: String,
        value: 'none'
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `autocorrect` property.
       */
      autocorrect: {
        type: String,
        value: 'off'
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `autosave` property,
       * used with type=search.
       */
      autosave: {
        type: String
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `results` property,
       * used with type=search.
       */
      results: {
        type: Number
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the `<input is="iron-input">`'s `accept` property,
       * used with type=file.
       */
      accept: {
        type: String
      },

      /**
       * If you're using PaperInputBehavior to implement your own paper-input-like
       * element, bind this to the`<input is="iron-input">`'s `multiple` property,
       * used with type=file.
       */
      multiple: {
        type: Boolean
      },

      _ariaDescribedBy: {
        type: String,
        value: ''
      },

      _ariaLabelledBy: {
        type: String,
        value: ''
      }

    },

    listeners: {
      'addon-attached': '_onAddonAttached',
    },

    keyBindings: {
      'shift+tab:keydown': '_onShiftTabDown'
    },

    hostAttributes: {
      tabindex: 0
    },

    /**
     * Returns a reference to the input element.
     */
    get inputElement() {
      return this.$.input;
    },

    /**
     * Returns a reference to the focusable element.
     */
    get _focusableElement() {
      return this.inputElement;
    },

    registered: function() {
      // These types have some default placeholder text; overlapping
      // the label on top of it looks terrible. Auto-float the label in this case.
      this._typesThatHaveText = ["date", "datetime", "datetime-local", "month",
          "time", "week", "file"];
    },

    attached: function() {
      this._updateAriaLabelledBy();

      if (this.inputElement &&
          this._typesThatHaveText.indexOf(this.inputElement.type) !== -1) {
        this.alwaysFloatLabel = true;
      }
    },

    _appendStringWithSpace: function(str, more) {
      if (str) {
        str = str + ' ' + more;
      } else {
        str = more;
      }
      return str;
    },

    _onAddonAttached: function(event) {
      var target = event.path ? event.path[0] : event.target;
      if (target.id) {
        this._ariaDescribedBy = this._appendStringWithSpace(this._ariaDescribedBy, target.id);
      } else {
        var id = 'paper-input-add-on-' + Polymer.PaperInputHelper.NextAddonID++;
        target.id = id;
        this._ariaDescribedBy = this._appendStringWithSpace(this._ariaDescribedBy, id);
      }
    },

    /**
     * Validates the input element and sets an error style if needed.
     *
     * @return {boolean}
     */
    validate: function() {
      return this.inputElement.validate();
    },

    /**
     * Forward focus to inputElement. Overriden from IronControlState.
     */
    _focusBlurHandler: function(event) {
      Polymer.IronControlState._focusBlurHandler.call(this, event);

      // Forward the focus to the nested input.
      if (this.focused && !this._shiftTabPressed)
        this._focusableElement.focus();
    },

    /**
     * Handler that is called when a shift+tab keypress is detected by the menu.
     *
     * @param {CustomEvent} event A key combination event.
     */
    _onShiftTabDown: function(event) {
      var oldTabIndex = this.getAttribute('tabindex');
      this._shiftTabPressed = true;
      this.setAttribute('tabindex', '-1');
      this.async(function() {
        this.setAttribute('tabindex', oldTabIndex);
        this._shiftTabPressed = false;
      }, 1);
    },

    /**
     * If `autoValidate` is true, then validates the element.
     */
    _handleAutoValidate: function() {
      if (this.autoValidate)
        this.validate();
    },

    /**
     * Restores the cursor to its original position after updating the value.
     * @param {string} newValue The value that should be saved.
     */
    updateValueAndPreserveCaret: function(newValue) {
      // Not all elements might have selection, and even if they have the
      // right properties, accessing them might throw an exception (like for
      // <input type=number>)
      try {
        var start = this.inputElement.selectionStart;
        this.value = newValue;

        // The cursor automatically jumps to the end after re-setting the value,
        // so restore it to its original position.
        this.inputElement.selectionStart = start;
        this.inputElement.selectionEnd = start;
      } catch (e) {
        // Just set the value and give up on the caret.
        this.value = newValue;
      }
    },

    _computeAlwaysFloatLabel: function(alwaysFloatLabel, placeholder) {
      return placeholder || alwaysFloatLabel;
    },

    _updateAriaLabelledBy: function() {
      var label = Polymer.dom(this.root).querySelector('label');
      if (!label) {
        this._ariaLabelledBy = '';
        return;
      }
      var labelledBy;
      if (label.id) {
        labelledBy = label.id;
      } else {
        labelledBy = 'paper-input-label-' + Polymer.PaperInputHelper.NextLabelID++;
        label.id = labelledBy;
      }
      this._ariaLabelledBy = labelledBy;
    },

    _onChange:function(event) {
      // In the Shadow DOM, the `change` event is not leaked into the
      // ancestor tree, so we must do this manually.
      // See https://w3c.github.io/webcomponents/spec/shadow/#events-that-are-not-leaked-into-ancestor-trees.
      if (this.shadowRoot) {
        this.fire(event.type, {sourceEvent: event}, {
          node: this,
          bubbles: event.bubbles,
          cancelable: event.cancelable
        });
      }
    },

    _autofocusChanged: function() {
      // Firefox doesn't respect the autofocus attribute if it's applied after
      // the page is loaded (Chrome/WebKit do respect it), preventing an
      // autofocus attribute specified in markup from taking effect when the
      // element is upgraded. As a workaround, if the autofocus property is set,
      // and the focus hasn't already been moved elsewhere, we take focus.
      if (this.autofocus && this._focusableElement) {

        // In IE 11, the default document.activeElement can be the page's
        // outermost html element, but there are also cases (under the
        // polyfill?) in which the activeElement is not a real HTMLElement, but
        // just a plain object. We identify the latter case as having no valid
        // activeElement.
        var activeElement = document.activeElement;
        var isActiveElementValid = activeElement instanceof HTMLElement;

        // Has some other element has already taken the focus?
        var isSomeElementActive = isActiveElementValid &&
            activeElement !== document.body &&
            activeElement !== document.documentElement; /* IE 11 */
        if (!isSomeElementActive) {
          // No specific element has taken the focus yet, so we can take it.
          this._focusableElement.focus();
        }
      }
    }
  }

  /** @polymerBehavior */
  Polymer.PaperInputBehavior = [
    Polymer.IronControlState,
    Polymer.IronA11yKeysBehavior,
    Polymer.PaperInputBehaviorImpl
  ];
/**
   * Use `Polymer.PaperInputAddonBehavior` to implement an add-on for `<paper-input-container>`. A
   * add-on appears below the input, and may display information based on the input value and
   * validity such as a character counter or an error message.
   * @polymerBehavior
   */
  Polymer.PaperInputAddonBehavior = {

    hostAttributes: {
      'add-on': ''
    },

    attached: function() {
      this.fire('addon-attached');
    },

    /**
     * The function called by `<paper-input-container>` when the input value or validity changes.
     * @param {{
     *   inputElement: (Element|undefined),
     *   value: (string|undefined),
     *   invalid: boolean
     * }} state -
     *     inputElement: The input element.
     *     value: The input value.
     *     invalid: True if the input value is invalid.
     */
    update: function(state) {
    }

  };
Polymer({
    is: 'paper-input-char-counter',

    behaviors: [
      Polymer.PaperInputAddonBehavior
    ],

    properties: {
      _charCounterStr: {
        type: String,
        value: '0'
      }
    },

    /**
     * This overrides the update function in PaperInputAddonBehavior.
     * @param {{
     *   inputElement: (Element|undefined),
     *   value: (string|undefined),
     *   invalid: boolean
     * }} state -
     *     inputElement: The input element.
     *     value: The input value.
     *     invalid: True if the input value is invalid.
     */
    update: function(state) {
      if (!state.inputElement) {
        return;
      }

      state.value = state.value || '';

      var counter = state.value.toString().length.toString();

      if (state.inputElement.hasAttribute('maxlength')) {
        counter += '/' + state.inputElement.getAttribute('maxlength');
      }

      this._charCounterStr = counter;
    }
  });
Polymer({
    is: 'paper-input-container',

    properties: {
      /**
       * Set to true to disable the floating label. The label disappears when the input value is
       * not null.
       */
      noLabelFloat: {
        type: Boolean,
        value: false
      },

      /**
       * Set to true to always float the floating label.
       */
      alwaysFloatLabel: {
        type: Boolean,
        value: false
      },

      /**
       * The attribute to listen for value changes on.
       */
      attrForValue: {
        type: String,
        value: 'bind-value'
      },

      /**
       * Set to true to auto-validate the input value when it changes.
       */
      autoValidate: {
        type: Boolean,
        value: false
      },

      /**
       * True if the input is invalid. This property is set automatically when the input value
       * changes if auto-validating, or when the `iron-input-validate` event is heard from a child.
       */
      invalid: {
        observer: '_invalidChanged',
        type: Boolean,
        value: false
      },

      /**
       * True if the input has focus.
       */
      focused: {
        readOnly: true,
        type: Boolean,
        value: false,
        notify: true
      },

      _addons: {
        type: Array
        // do not set a default value here intentionally - it will be initialized lazily when a
        // distributed child is attached, which may occur before configuration for this element
        // in polyfill.
      },

      _inputHasContent: {
        type: Boolean,
        value: false
      },

      _inputSelector: {
        type: String,
        value: 'input,textarea,.paper-input-input'
      },

      _boundOnFocus: {
        type: Function,
        value: function() {
          return this._onFocus.bind(this);
        }
      },

      _boundOnBlur: {
        type: Function,
        value: function() {
          return this._onBlur.bind(this);
        }
      },

      _boundOnInput: {
        type: Function,
        value: function() {
          return this._onInput.bind(this);
        }
      },

      _boundValueChanged: {
        type: Function,
        value: function() {
          return this._onValueChanged.bind(this);
        }
      }
    },

    listeners: {
      'addon-attached': '_onAddonAttached',
      'iron-input-validate': '_onIronInputValidate'
    },

    get _valueChangedEvent() {
      return this.attrForValue + '-changed';
    },

    get _propertyForValue() {
      return Polymer.CaseMap.dashToCamelCase(this.attrForValue);
    },

    get _inputElement() {
      return Polymer.dom(this).querySelector(this._inputSelector);
    },

    get _inputElementValue() {
      return this._inputElement[this._propertyForValue] || this._inputElement.value;
    },

    ready: function() {
      if (!this._addons) {
        this._addons = [];
      }
      this.addEventListener('focus', this._boundOnFocus, true);
      this.addEventListener('blur', this._boundOnBlur, true);
    },

    attached: function() {
      if (this.attrForValue) {
        this._inputElement.addEventListener(this._valueChangedEvent, this._boundValueChanged);
      } else {
        this.addEventListener('input', this._onInput);
      }

      // Only validate when attached if the input already has a value.
      if (this._inputElementValue != '') {
        this._handleValueAndAutoValidate(this._inputElement);
      } else {
        this._handleValue(this._inputElement);
      }
    },

    _onAddonAttached: function(event) {
      if (!this._addons) {
        this._addons = [];
      }
      var target = event.target;
      if (this._addons.indexOf(target) === -1) {
        this._addons.push(target);
        if (this.isAttached) {
          this._handleValue(this._inputElement);
        }
      }
    },

    _onFocus: function() {
      this._setFocused(true);
    },

    _onBlur: function() {
      this._setFocused(false);
      this._handleValueAndAutoValidate(this._inputElement);
    },

    _onInput: function(event) {
      this._handleValueAndAutoValidate(event.target);
    },

    _onValueChanged: function(event) {
      this._handleValueAndAutoValidate(event.target);
    },

    _handleValue: function(inputElement) {
      var value = this._inputElementValue;

      // type="number" hack needed because this.value is empty until it's valid
      if (value || value === 0 || (inputElement.type === 'number' && !inputElement.checkValidity())) {
        this._inputHasContent = true;
      } else {
        this._inputHasContent = false;
      }

      this.updateAddons({
        inputElement: inputElement,
        value: value,
        invalid: this.invalid
      });
    },

    _handleValueAndAutoValidate: function(inputElement) {
      if (this.autoValidate) {
        var valid;
        if (inputElement.validate) {
          valid = inputElement.validate(this._inputElementValue);
        } else {
          valid = inputElement.checkValidity();
        }
        this.invalid = !valid;
      }

      // Call this last to notify the add-ons.
      this._handleValue(inputElement);
    },

    _onIronInputValidate: function(event) {
      this.invalid = this._inputElement.invalid;
    },

    _invalidChanged: function() {
      if (this._addons) {
        this.updateAddons({invalid: this.invalid});
      }
    },

    /**
     * Call this to update the state of add-ons.
     * @param {Object} state Add-on state.
     */
    updateAddons: function(state) {
      for (var addon, index = 0; addon = this._addons[index]; index++) {
        addon.update(state);
      }
    },

    _computeInputContentClass: function(noLabelFloat, alwaysFloatLabel, focused, invalid, _inputHasContent) {
      var cls = 'input-content';
      if (!noLabelFloat) {
        var label = this.querySelector('label');

        if (alwaysFloatLabel || _inputHasContent) {
          cls += ' label-is-floating';
          // If the label is floating, ignore any offsets that may have been
          // applied from a prefix element.
          this.$.labelAndInputContainer.style.position = 'static';

          if (invalid) {
            cls += ' is-invalid';
          } else if (focused) {
            cls += " label-is-highlighted";
          }
        } else {
          // When the label is not floating, it should overlap the input element.
          if (label) {
            this.$.labelAndInputContainer.style.position = 'relative';
          }
        }
      } else {
        if (_inputHasContent) {
          cls += ' label-is-hidden';
        }
      }
      return cls;
    },

    _computeUnderlineClass: function(focused, invalid) {
      var cls = 'underline';
      if (invalid) {
        cls += ' is-invalid';
      } else if (focused) {
        cls += ' is-highlighted'
      }
      return cls;
    },

    _computeAddOnContentClass: function(focused, invalid) {
      var cls = 'add-on-content';
      if (invalid) {
        cls += ' is-invalid';
      } else if (focused) {
        cls += ' is-highlighted'
      }
      return cls;
    }
  });
Polymer({
    is: 'paper-input-error',

    behaviors: [
      Polymer.PaperInputAddonBehavior
    ],

    properties: {
      /**
       * True if the error is showing.
       */
      invalid: {
        readOnly: true,
        reflectToAttribute: true,
        type: Boolean
      }
    },

    /**
     * This overrides the update function in PaperInputAddonBehavior.
     * @param {{
     *   inputElement: (Element|undefined),
     *   value: (string|undefined),
     *   invalid: boolean
     * }} state -
     *     inputElement: The input element.
     *     value: The input value.
     *     invalid: True if the input value is invalid.
     */
    update: function(state) {
      this._setInvalid(state.invalid);
    }
  });
Polymer({
    is: 'paper-input',

    behaviors: [
      Polymer.IronFormElementBehavior,
      Polymer.PaperInputBehavior
    ]
  });
Polymer({
    is: 'paper-progress',

    behaviors: [
      Polymer.IronRangeBehavior
    ],

    properties: {
      /**
       * The number that represents the current secondary progress.
       */
      secondaryProgress: {
        type: Number,
        value: 0
      },

      /**
       * The secondary ratio
       */
      secondaryRatio: {
        type: Number,
        value: 0,
        readOnly: true
      },

      /**
       * Use an indeterminate progress indicator.
       */
      indeterminate: {
        type: Boolean,
        value: false,
        observer: '_toggleIndeterminate'
      },

      /**
       * True if the progress is disabled.
       */
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        observer: '_disabledChanged'
      }
    },

    observers: [
      '_progressChanged(secondaryProgress, value, min, max)'
    ],

    hostAttributes: {
      role: 'progressbar'
    },

    _toggleIndeterminate: function(indeterminate) {
      // If we use attribute/class binding, the animation sometimes doesn't translate properly
      // on Safari 7.1. So instead, we toggle the class here in the update method.
      this.toggleClass('indeterminate', indeterminate, this.$.primaryProgress);
    },

    _transformProgress: function(progress, ratio) {
      var transform = 'scaleX(' + (ratio / 100) + ')';
      progress.style.transform = progress.style.webkitTransform = transform;
    },

    _mainRatioChanged: function(ratio) {
      this._transformProgress(this.$.primaryProgress, ratio);
    },

    _progressChanged: function(secondaryProgress, value, min, max) {
      secondaryProgress = this._clampValue(secondaryProgress);
      value = this._clampValue(value);

      var secondaryRatio = this._calcRatio(secondaryProgress) * 100;
      var mainRatio = this._calcRatio(value) * 100;

      this._setSecondaryRatio(secondaryRatio);
      this._transformProgress(this.$.secondaryProgress, secondaryRatio);
      this._transformProgress(this.$.primaryProgress, mainRatio);

      this.secondaryProgress = secondaryProgress;

      this.setAttribute('aria-valuenow', value);
      this.setAttribute('aria-valuemin', min);
      this.setAttribute('aria-valuemax', max);
    },

    _disabledChanged: function(disabled) {
      this.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    },

    _hideSecondaryProgress: function(secondaryRatio) {
      return secondaryRatio === 0;
    }
  });
Polymer({
      is: 'paper-slider',

      behaviors: [
        Polymer.IronA11yKeysBehavior,
        Polymer.IronFormElementBehavior,
        Polymer.PaperInkyFocusBehavior,
        Polymer.IronRangeBehavior
      ],

      properties: {
        /**
         * If true, the slider thumb snaps to tick marks evenly spaced based
         * on the `step` property value.
         */
        snaps: {
          type: Boolean,
          value: false,
          notify: true
        },

        /**
         * If true, a pin with numeric value label is shown when the slider thumb
         * is pressed. Use for settings for which users need to know the exact
         * value of the setting.
         */
        pin: {
          type: Boolean,
          value: false,
          notify: true
        },

        /**
         * The number that represents the current secondary progress.
         */
        secondaryProgress: {
          type: Number,
          value: 0,
          notify: true,
          observer: '_secondaryProgressChanged'
        },

        /**
         * If true, an input is shown and user can use it to set the slider value.
         */
        editable: {
          type: Boolean,
          value: false
        },

        /**
         * The immediate value of the slider.  This value is updated while the user
         * is dragging the slider.
         */
        immediateValue: {
          type: Number,
          value: 0,
          readOnly: true,
          notify: true
        },

        /**
         * The maximum number of markers
         */
        maxMarkers: {
          type: Number,
          value: 0,
          notify: true
        },

        /**
         * If true, the knob is expanded
         */
        expand: {
          type: Boolean,
          value: false,
          readOnly: true
        },

        /**
         * True when the user is dragging the slider.
         */
        dragging: {
          type: Boolean,
          value: false,
          readOnly: true
        },

        transiting: {
          type: Boolean,
          value: false,
          readOnly: true
        },

        markers: {
          type: Array,
          readOnly: true,
          value: []
        },
      },

      observers: [
        '_updateKnob(value, min, max, snaps, step)',
        '_valueChanged(value)',
        '_immediateValueChanged(immediateValue)',
        '_updateMarkers(maxMarkers, min, max, snaps)'
      ],

      hostAttributes: {
        role: 'slider',
        tabindex: 0
      },

      keyBindings: {
        'left down pagedown home': '_decrementKey',
        'right up pageup end': '_incrementKey'
      },

      /**
       * Increases value by `step` but not above `max`.
       * @method increment
       */
      increment: function() {
        this.value = this._clampValue(this.value + this.step);
      },

      /**
       * Decreases value by `step` but not below `min`.
       * @method decrement
       */
      decrement: function() {
        this.value = this._clampValue(this.value - this.step);
      },

      _updateKnob: function(value, min, max, snaps, step) {
        this.setAttribute('aria-valuemin', min);
        this.setAttribute('aria-valuemax', max);
        this.setAttribute('aria-valuenow', value);

        this._positionKnob(this._calcRatio(value));
      },

      _valueChanged: function() {
        this.fire('value-change');
      },

      _immediateValueChanged: function() {
        if (this.dragging) {
          this.fire('immediate-value-change');
        } else {
          this.value = this.immediateValue;
        }
      },

      _secondaryProgressChanged: function() {
        this.secondaryProgress = this._clampValue(this.secondaryProgress);
      },

      _expandKnob: function() {
        this._setExpand(true);
      },

      _resetKnob: function() {
        this.cancelDebouncer('expandKnob');
        this._setExpand(false);
      },

      _positionKnob: function(ratio) {
        this._setImmediateValue(this._calcStep(this._calcKnobPosition(ratio)));
        this._setRatio(this._calcRatio(this.immediateValue));

        this.$.sliderKnob.style.left = (this.ratio * 100) + '%';
        if (this.dragging) {
          this._knobstartx = this.ratio * this._w;
          this.translate3d(0, 0, 0, this.$.sliderKnob);
        }
      },

      _calcKnobPosition: function(ratio) {
        return (this.max - this.min) * ratio + this.min;
      },

      _onTrack: function(event) {
        event.stopPropagation();
        switch (event.detail.state) {
          case 'start':
            this._trackStart(event);
            break;
          case 'track':
            this._trackX(event);
            break;
          case 'end':
            this._trackEnd();
            break;
        }
      },

      _trackStart: function(event) {
        this._w = this.$.sliderBar.offsetWidth;
        this._x = this.ratio * this._w;
        this._startx = this._x;
        this._knobstartx = this._startx;
        this._minx = - this._startx;
        this._maxx = this._w - this._startx;
        this.$.sliderKnob.classList.add('dragging');
        this._setDragging(true);
      },

      _trackX: function(e) {
        if (!this.dragging) {
          this._trackStart(e);
        }

        var dx = Math.min(this._maxx, Math.max(this._minx, e.detail.dx));
        this._x = this._startx + dx;

        var immediateValue = this._calcStep(this._calcKnobPosition(this._x / this._w));
        this._setImmediateValue(immediateValue);

        // update knob's position
        var translateX = ((this._calcRatio(this.immediateValue) * this._w) - this._knobstartx);
        this.translate3d(translateX + 'px', 0, 0, this.$.sliderKnob);
      },

      _trackEnd: function() {
        var s = this.$.sliderKnob.style;

        this.$.sliderKnob.classList.remove('dragging');
        this._setDragging(false);
        this._resetKnob();
        this.value = this.immediateValue;

        s.transform = s.webkitTransform = '';

        this.fire('change');
      },

      _knobdown: function(event) {
        this._expandKnob();

        // cancel selection
        event.preventDefault();

        // set the focus manually because we will called prevent default
        this.focus();
      },

      _bardown: function(event) {
        this._w = this.$.sliderBar.offsetWidth;
        var rect = this.$.sliderBar.getBoundingClientRect();
        var ratio = (event.detail.x - rect.left) / this._w;
        var prevRatio = this.ratio;

        this._setTransiting(true);

        this._positionKnob(ratio);

        this.debounce('expandKnob', this._expandKnob, 60);

        // if the ratio doesn't change, sliderKnob's animation won't start
        // and `_knobTransitionEnd` won't be called
        // Therefore, we need to manually update the `transiting` state

        if (prevRatio === this.ratio) {
          this._setTransiting(false);
        }

        this.async(function() {
          this.fire('change');
        });

        // cancel selection
        event.preventDefault();

        // set the focus manually because we will called prevent default
        this.focus();
      },

      _knobTransitionEnd: function(event) {
        if (event.target === this.$.sliderKnob) {
          this._setTransiting(false);
        }
      },

      _updateMarkers: function(maxMarkers, min, max, snaps) {
        if (!snaps) {
          this._setMarkers([]);
        }
        var steps = Math.round((max - min) / this.step);
        if (steps > maxMarkers) {
          steps = maxMarkers;
        }
        this._setMarkers(new Array(steps));
      },

      _mergeClasses: function(classes) {
        return Object.keys(classes).filter(
          function(className) {
            return classes[className];
          }).join(' ');
      },

      _getClassNames: function() {
        return this._mergeClasses({
          disabled: this.disabled,
          pin: this.pin,
          snaps: this.snaps,
          ring: this.immediateValue <= this.min,
          expand: this.expand,
          dragging: this.dragging,
          transiting: this.transiting,
          editable: this.editable
        });
      },

      _incrementKey: function(event) {
        if (!this.disabled) {
          if (event.detail.key === 'end') {
            this.value = this.max;
          } else {
            this.increment();
          }
          this.fire('change');
        }
      },

      _decrementKey: function(event) {
        if (!this.disabled) {
          if (event.detail.key === 'home') {
            this.value = this.min;
          } else {
            this.decrement();
          }
          this.fire('change');
        }
      },

      _changeValue: function(event) {
        this.value = event.target.value;
        this.fire('change');
      },

      _inputKeyDown: function(event) {
        event.stopPropagation();
      },

      // create the element ripple inside the `sliderKnob`
      _createRipple: function() {
        this._rippleContainer = this.$.sliderKnob;
        return Polymer.PaperInkyFocusBehaviorImpl._createRipple.call(this);
      },

      // Hide the ripple when user is not interacting with keyboard.
      // This behavior is different from other ripple-y controls, but is
      // according to spec: https://www.google.com/design/spec/components/sliders.html
      _focusedChanged: function(receivedFocusFromKeyboard) {
        if (receivedFocusFromKeyboard) {
          this.ensureRipple();
        }
        if (this.hasRipple()) {
          // note, ripple must be un-hidden prior to setting `holdDown`
          if (receivedFocusFromKeyboard) {
            this._ripple.style.display = '';
          } else {
            this._ripple.style.display = 'none';
          }
          this._ripple.holdDown = receivedFocusFromKeyboard;
        }
      }
    });

    /**
     * Fired when the slider's value changes.
     *
     * @event value-change
     */

    /**
     * Fired when the slider's immediateValue changes. Only occurs while the
     * user is dragging.
     *
     * To detect changes to immediateValue that happen for any input (i.e.                                                          
     * dragging, tapping, clicking, etc.) listen for immediate-value-changed
     * instead.
     *
     * @event immediate-value-change
     */

    /**
     * Fired when the slider's value changes due to user interaction.
     *
     * Changes to the slider's value due to changes in an underlying
     * bound variable will not trigger this event.
     *
     * @event change
     */
/**
   * `Polymer.NeonAnimationRunnerBehavior` adds a method to run animations.
   *
   * @polymerBehavior Polymer.NeonAnimationRunnerBehavior
   */
  Polymer.NeonAnimationRunnerBehaviorImpl = {

    properties: {

      _animationMeta: {
        type: Object,
        value: function() {
          return new Polymer.IronMeta({type: 'animation'});
        }
      },

      /** @type {?Object} */
      _player: {
        type: Object
      }

    },

    _configureAnimationEffects: function(allConfigs) {
      var allAnimations = [];
      if (allConfigs.length > 0) {
        for (var config, index = 0; config = allConfigs[index]; index++) {
          var animationConstructor = this._animationMeta.byKey(config.name);
          if (animationConstructor) {
            var animation = animationConstructor && new animationConstructor();
            var effect = animation.configure(config);
            if (effect) {
              allAnimations.push({
                animation: animation,
                config: config,
                effect: effect
              });
            }
          } else {
            console.warn(this.is + ':', config.name, 'not found!');
          }
        }
      }
      return allAnimations;
    },

    _runAnimationEffects: function(allEffects) {
      return document.timeline.play(new GroupEffect(allEffects));
    },

    _completeAnimations: function(allAnimations) {
      for (var animation, index = 0; animation = allAnimations[index]; index++) {
        animation.animation.complete(animation.config);
      }
    },

    /**
     * Plays an animation with an optional `type`.
     * @param {string=} type
     * @param {!Object=} cookie
     */
    playAnimation: function(type, cookie) {
      var allConfigs = this.getAnimationConfig(type);
      if (!allConfigs) {
        return;
      }
      var allAnimations = this._configureAnimationEffects(allConfigs);
      var allEffects = allAnimations.map(function(animation) {
        return animation.effect;
      });

      if (allEffects.length > 0) {
        this._player = this._runAnimationEffects(allEffects);
        this._player.onfinish = function() {
          this._completeAnimations(allAnimations);

          if (this._player) {
            this._player.cancel();
            this._player = null;
          }

          this.fire('neon-animation-finish', cookie, {bubbles: false});
        }.bind(this);

      } else {
        this.fire('neon-animation-finish', cookie, {bubbles: false});
      }
    },

    /**
     * Cancels the currently running animation.
     */
    cancelAnimation: function() {
      if (this._player) {
        this._player.cancel();
      }
    }
  };

  /** @polymerBehavior Polymer.NeonAnimationRunnerBehavior */
  Polymer.NeonAnimationRunnerBehavior = [
    Polymer.NeonAnimatableBehavior,
    Polymer.NeonAnimationRunnerBehaviorImpl
  ];
/**
`Polymer.IronFitBehavior` fits an element in another element using `max-height` and `max-width`, and
optionally centers it in the window or another element.

The element will only be sized and/or positioned if it has not already been sized and/or positioned
by CSS.

CSS properties               | Action
-----------------------------|-------------------------------------------
`position` set               | Element is not centered horizontally or vertically
`top` or `bottom` set        | Element is not vertically centered
`left` or `right` set        | Element is not horizontally centered
`max-height` set             | Element respects `max-height`
`max-width` set              | Element respects `max-width`

`Polymer.IronFitBehavior` can position an element into another element using
`verticalAlign` and `horizontalAlign`. This will override the element's css position.

      <div class="container">
        <iron-fit-impl vertical-align="top" horizontal-align="auto">
          Positioned into the container
        </iron-fit-impl>
      </div>

Use `noOverlap` to position the element around another element without overlapping it.

      <div class="container">
        <iron-fit-impl no-overlap vertical-align="auto" horizontal-align="auto">
          Positioned around the container
        </iron-fit-impl>
      </div>

@demo demo/index.html
@polymerBehavior
*/

  Polymer.IronFitBehavior = {

    properties: {

      /**
       * The element that will receive a `max-height`/`width`. By default it is the same as `this`,
       * but it can be set to a child element. This is useful, for example, for implementing a
       * scrolling region inside the element.
       * @type {!Element}
       */
      sizingTarget: {
        type: Object,
        value: function() {
          return this;
        }
      },

      /**
       * The element to fit `this` into.
       */
      fitInto: {
        type: Object,
        value: window
      },

      /**
       * Will position the element around the positionTarget without overlapping it.
       */
      noOverlap: {
        type: Boolean
      },

      /**
       * The element that should be used to position the element. If not set, it will
       * default to the parent node.
       * @type {!Element}
       */
      positionTarget: {
        type: Element
      },

      /**
       * The orientation against which to align the element horizontally
       * relative to the `positionTarget`. Possible values are "left", "right", "auto".
       */
      horizontalAlign: {
        type: String
      },

      /**
       * The orientation against which to align the element vertically
       * relative to the `positionTarget`. Possible values are "top", "bottom", "auto".
       */
      verticalAlign: {
        type: String
      },

      /**
       * If true, it will use `horizontalAlign` and `verticalAlign` values as preferred alignment
       * and if there's not enough space, it will pick the values which minimize the cropping.
       */
      dynamicAlign: {
        type: Boolean
      },

      /**
       * The same as setting margin-left and margin-right css properties.
       * @deprecated
       */
      horizontalOffset: {
        type: Number,
        value: 0,
        notify: true
      },

      /**
       * The same as setting margin-top and margin-bottom css properties.
       * @deprecated
       */
      verticalOffset: {
        type: Number,
        value: 0,
        notify: true
      },

      /**
       * Set to true to auto-fit on attach.
       */
      autoFitOnAttach: {
        type: Boolean,
        value: false
      },

      /** @type {?Object} */
      _fitInfo: {
        type: Object
      }
    },

    get _fitWidth() {
      var fitWidth;
      if (this.fitInto === window) {
        fitWidth = this.fitInto.innerWidth;
      } else {
        fitWidth = this.fitInto.getBoundingClientRect().width;
      }
      return fitWidth;
    },

    get _fitHeight() {
      var fitHeight;
      if (this.fitInto === window) {
        fitHeight = this.fitInto.innerHeight;
      } else {
        fitHeight = this.fitInto.getBoundingClientRect().height;
      }
      return fitHeight;
    },

    get _fitLeft() {
      var fitLeft;
      if (this.fitInto === window) {
        fitLeft = 0;
      } else {
        fitLeft = this.fitInto.getBoundingClientRect().left;
      }
      return fitLeft;
    },

    get _fitTop() {
      var fitTop;
      if (this.fitInto === window) {
        fitTop = 0;
      } else {
        fitTop = this.fitInto.getBoundingClientRect().top;
      }
      return fitTop;
    },

    /**
     * The element that should be used to position the element,
     * if no position target is configured.
     */
    get _defaultPositionTarget() {
      var parent = Polymer.dom(this).parentNode;

      if (parent && parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        parent = parent.host;
      }

      return parent;
    },

    /**
     * The horizontal align value, accounting for the RTL/LTR text direction.
     */
    get _localeHorizontalAlign() {
      if (this._isRTL) {
        // In RTL, "left" becomes "right".
        if (this.horizontalAlign === 'right') {
          return 'left';
        }
        if (this.horizontalAlign === 'left') {
          return 'right';
        }
      }
      return this.horizontalAlign;
    },

    attached: function() {
      // Memoize this to avoid expensive calculations & relayouts.
      this._isRTL = window.getComputedStyle(this).direction == 'rtl';
      this.positionTarget = this.positionTarget || this._defaultPositionTarget;
      if (this.autoFitOnAttach) {
        if (window.getComputedStyle(this).display === 'none') {
          setTimeout(function() {
            this.fit();
          }.bind(this));
        } else {
          this.fit();
        }
      }
    },

    /**
     * Positions and fits the element into the `fitInto` element.
     */
    fit: function() {
      this.position();
      this.constrain();
      this.center();
    },

    /**
     * Memoize information needed to position and size the target element.
     * @suppress {deprecated}
     */
    _discoverInfo: function() {
      if (this._fitInfo) {
        return;
      }
      var target = window.getComputedStyle(this);
      var sizer = window.getComputedStyle(this.sizingTarget);

      this._fitInfo = {
        inlineStyle: {
          top: this.style.top || '',
          left: this.style.left || '',
          position: this.style.position || ''
        },
        sizerInlineStyle: {
          maxWidth: this.sizingTarget.style.maxWidth || '',
          maxHeight: this.sizingTarget.style.maxHeight || '',
          boxSizing: this.sizingTarget.style.boxSizing || ''
        },
        positionedBy: {
          vertically: target.top !== 'auto' ? 'top' : (target.bottom !== 'auto' ?
            'bottom' : null),
          horizontally: target.left !== 'auto' ? 'left' : (target.right !== 'auto' ?
            'right' : null)
        },
        sizedBy: {
          height: sizer.maxHeight !== 'none',
          width: sizer.maxWidth !== 'none',
          minWidth: parseInt(sizer.minWidth, 10) || 0,
          minHeight: parseInt(sizer.minHeight, 10) || 0
        },
        margin: {
          top: parseInt(target.marginTop, 10) || 0,
          right: parseInt(target.marginRight, 10) || 0,
          bottom: parseInt(target.marginBottom, 10) || 0,
          left: parseInt(target.marginLeft, 10) || 0
        }
      };

      // Support these properties until they are removed.
      if (this.verticalOffset) {
        this._fitInfo.margin.top = this._fitInfo.margin.bottom = this.verticalOffset;
        this._fitInfo.inlineStyle.marginTop = this.style.marginTop || '';
        this._fitInfo.inlineStyle.marginBottom = this.style.marginBottom || '';
        this.style.marginTop = this.style.marginBottom = this.verticalOffset + 'px';
      }
      if (this.horizontalOffset) {
        this._fitInfo.margin.left = this._fitInfo.margin.right = this.horizontalOffset;
        this._fitInfo.inlineStyle.marginLeft = this.style.marginLeft || '';
        this._fitInfo.inlineStyle.marginRight = this.style.marginRight || '';
        this.style.marginLeft = this.style.marginRight = this.horizontalOffset + 'px';
      }
    },

    /**
     * Resets the target element's position and size constraints, and clear
     * the memoized data.
     */
    resetFit: function() {
      var info = this._fitInfo || {};
      for (var property in info.sizerInlineStyle) {
        this.sizingTarget.style[property] = info.sizerInlineStyle[property];
      }
      for (var property in info.inlineStyle) {
        this.style[property] = info.inlineStyle[property];
      }

      this._fitInfo = null;
    },

    /**
     * Equivalent to calling `resetFit()` and `fit()`. Useful to call this after
     * the element or the `fitInto` element has been resized, or if any of the
     * positioning properties (e.g. `horizontalAlign, verticalAlign`) is updated.
     * It preserves the scroll position of the sizingTarget.
     */
    refit: function() {
      var scrollLeft = this.sizingTarget.scrollLeft;
      var scrollTop = this.sizingTarget.scrollTop;
      this.resetFit();
      this.fit();
      this.sizingTarget.scrollLeft = scrollLeft;
      this.sizingTarget.scrollTop = scrollTop;
    },

    /**
     * Positions the element according to `horizontalAlign, verticalAlign`.
     */
    position: function() {
      if (!this.horizontalAlign && !this.verticalAlign) {
        // needs to be centered, and it is done after constrain.
        return;
      }
      this._discoverInfo();

      this.style.position = 'fixed';
      // Need border-box for margin/padding.
      this.sizingTarget.style.boxSizing = 'border-box';
      // Set to 0, 0 in order to discover any offset caused by parent stacking contexts.
      this.style.left = '0px';
      this.style.top = '0px';

      var rect = this.getBoundingClientRect();
      var positionRect = this.__getNormalizedRect(this.positionTarget);
      var fitRect = this.__getNormalizedRect(this.fitInto);

      var margin = this._fitInfo.margin;

      // Consider the margin as part of the size for position calculations.
      var size = {
        width: rect.width + margin.left + margin.right,
        height: rect.height + margin.top + margin.bottom
      };

      var position = this.__getPosition(this._localeHorizontalAlign, this.verticalAlign, size, positionRect, fitRect);

      var left = position.left + margin.left;
      var top = position.top + margin.top;

      // Use original size (without margin).
      var right = Math.min(fitRect.right - margin.right, left + rect.width);
      var bottom = Math.min(fitRect.bottom - margin.bottom, top + rect.height);

      var minWidth = this._fitInfo.sizedBy.minWidth;
      var minHeight = this._fitInfo.sizedBy.minHeight;
      if (left < margin.left) {
        left = margin.left;
        if (right - left < minWidth) {
          left = right - minWidth;
        }
      }
      if (top < margin.top) {
        top = margin.top;
        if (bottom - top < minHeight) {
          top = bottom - minHeight;
        }
      }

      this.sizingTarget.style.maxWidth = (right - left) + 'px';
      this.sizingTarget.style.maxHeight = (bottom - top) + 'px';

      // Remove the offset caused by any stacking context.
      this.style.left = (left - rect.left) + 'px';
      this.style.top = (top - rect.top) + 'px';
    },

    /**
     * Constrains the size of the element to `fitInto` by setting `max-height`
     * and/or `max-width`.
     */
    constrain: function() {
      if (this.horizontalAlign || this.verticalAlign) {
        return;
      }
      this._discoverInfo();

      var info = this._fitInfo;
      // position at (0px, 0px) if not already positioned, so we can measure the natural size.
      if (!info.positionedBy.vertically) {
        this.style.position = 'fixed';
        this.style.top = '0px';
      }
      if (!info.positionedBy.horizontally) {
        this.style.position = 'fixed';
        this.style.left = '0px';
      }

      // need border-box for margin/padding
      this.sizingTarget.style.boxSizing = 'border-box';
      // constrain the width and height if not already set
      var rect = this.getBoundingClientRect();
      if (!info.sizedBy.height) {
        this.__sizeDimension(rect, info.positionedBy.vertically, 'top', 'bottom', 'Height');
      }
      if (!info.sizedBy.width) {
        this.__sizeDimension(rect, info.positionedBy.horizontally, 'left', 'right', 'Width');
      }
    },

    /**
     * @protected
     * @deprecated
     */
    _sizeDimension: function(rect, positionedBy, start, end, extent) {
      this.__sizeDimension(rect, positionedBy, start, end, extent);
    },

    /**
     * @private
     */
    __sizeDimension: function(rect, positionedBy, start, end, extent) {
      var info = this._fitInfo;
      var fitRect = this.__getNormalizedRect(this.fitInto);
      var max = extent === 'Width' ? fitRect.width : fitRect.height;
      var flip = (positionedBy === end);
      var offset = flip ? max - rect[end] : rect[start];
      var margin = info.margin[flip ? start : end];
      var offsetExtent = 'offset' + extent;
      var sizingOffset = this[offsetExtent] - this.sizingTarget[offsetExtent];
      this.sizingTarget.style['max' + extent] = (max - margin - offset - sizingOffset) + 'px';
    },

    /**
     * Centers horizontally and vertically if not already positioned. This also sets
     * `position:fixed`.
     */
    center: function() {
      if (this.horizontalAlign || this.verticalAlign) {
        return;
      }
      this._discoverInfo();

      var positionedBy = this._fitInfo.positionedBy;
      if (positionedBy.vertically && positionedBy.horizontally) {
        // Already positioned.
        return;
      }
      // Need position:fixed to center
      this.style.position = 'fixed';
      // Take into account the offset caused by parents that create stacking
      // contexts (e.g. with transform: translate3d). Translate to 0,0 and
      // measure the bounding rect.
      if (!positionedBy.vertically) {
        this.style.top = '0px';
      }
      if (!positionedBy.horizontally) {
        this.style.left = '0px';
      }
      // It will take in consideration margins and transforms
      var rect = this.getBoundingClientRect();
      var fitRect = this.__getNormalizedRect(this.fitInto);
      if (!positionedBy.vertically) {
        var top = fitRect.top - rect.top + (fitRect.height - rect.height) / 2;
        this.style.top = top + 'px';
      }
      if (!positionedBy.horizontally) {
        var left = fitRect.left - rect.left + (fitRect.width - rect.width) / 2;
        this.style.left = left + 'px';
      }
    },

    __getNormalizedRect: function(target) {
      if (target === document.documentElement || target === window) {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          right: window.innerWidth,
          bottom: window.innerHeight
        };
      }
      return target.getBoundingClientRect();
    },

    __getCroppedArea: function(position, size, fitRect) {
      var verticalCrop = Math.min(0, position.top) + Math.min(0, fitRect.bottom - (position.top + size.height));
      var horizontalCrop = Math.min(0, position.left) + Math.min(0, fitRect.right - (position.left + size.width));
      return Math.abs(verticalCrop) * size.width + Math.abs(horizontalCrop) * size.height;
    },


    __getPosition: function(hAlign, vAlign, size, positionRect, fitRect) {
      // All the possible configurations.
      // Ordered as top-left, top-right, bottom-left, bottom-right.
      var positions = [{
        verticalAlign: 'top',
        horizontalAlign: 'left',
        top: positionRect.top,
        left: positionRect.left
      }, {
        verticalAlign: 'top',
        horizontalAlign: 'right',
        top: positionRect.top,
        left: positionRect.right - size.width
      }, {
        verticalAlign: 'bottom',
        horizontalAlign: 'left',
        top: positionRect.bottom - size.height,
        left: positionRect.left
      }, {
        verticalAlign: 'bottom',
        horizontalAlign: 'right',
        top: positionRect.bottom - size.height,
        left: positionRect.right - size.width
      }];

      if (this.noOverlap) {
        // Duplicate.
        for (var i = 0, l = positions.length; i < l; i++) {
          var copy = {};
          for (var key in positions[i]) {
            copy[key] = positions[i][key];
          }
          positions.push(copy);
        }
        // Horizontal overlap only.
        positions[0].top = positions[1].top += positionRect.height;
        positions[2].top = positions[3].top -= positionRect.height;
        // Vertical overlap only.
        positions[4].left = positions[6].left += positionRect.width;
        positions[5].left = positions[7].left -= positionRect.width;
      }

      // Consider auto as null for coding convenience.
      vAlign = vAlign === 'auto' ? null : vAlign;
      hAlign = hAlign === 'auto' ? null : hAlign;

      var position;
      for (var i = 0; i < positions.length; i++) {
        var pos = positions[i];

        // If both vAlign and hAlign are defined, return exact match.
        // For dynamicAlign and noOverlap we'll have more than one candidate, so
        // we'll have to check the croppedArea to make the best choice.
        if (!this.dynamicAlign && !this.noOverlap &&
            pos.verticalAlign === vAlign && pos.horizontalAlign === hAlign) {
          position = pos;
          break;
        }

        // Align is ok if alignment preferences are respected. If no preferences,
        // it is considered ok.
        var alignOk = (!vAlign || pos.verticalAlign === vAlign) &&
                      (!hAlign || pos.horizontalAlign === hAlign);

        // Filter out elements that don't match the alignment (if defined).
        // With dynamicAlign, we need to consider all the positions to find the
        // one that minimizes the cropped area.
        if (!this.dynamicAlign && !alignOk) {
          continue;
        }

        position = position || pos;
        pos.croppedArea = this.__getCroppedArea(pos, size, fitRect);
        var diff = pos.croppedArea - position.croppedArea;
        // Check which crops less. If it crops equally, check if align is ok.
        if (diff < 0 || (diff === 0 && alignOk)) {
          position = pos;
        }
        // If not cropped and respects the align requirements, keep it.
        // This allows to prefer positions overlapping horizontally over the
        // ones overlapping vertically.
        if (position.croppedArea === 0 && alignOk) {
          break;
        }
      }

      return position;
    }

  };
/**
   * `IronResizableBehavior` is a behavior that can be used in Polymer elements to
   * coordinate the flow of resize events between "resizers" (elements that control the
   * size or hidden state of their children) and "resizables" (elements that need to be
   * notified when they are resized or un-hidden by their parents in order to take
   * action on their new measurements).
   *
   * Elements that perform measurement should add the `IronResizableBehavior` behavior to
   * their element definition and listen for the `iron-resize` event on themselves.
   * This event will be fired when they become showing after having been hidden,
   * when they are resized explicitly by another resizable, or when the window has been
   * resized.
   *
   * Note, the `iron-resize` event is non-bubbling.
   *
   * @polymerBehavior Polymer.IronResizableBehavior
   * @demo demo/index.html
   **/
  Polymer.IronResizableBehavior = {
    properties: {
      /**
       * The closest ancestor element that implements `IronResizableBehavior`.
       */
      _parentResizable: {
        type: Object,
        observer: '_parentResizableChanged'
      },

      /**
       * True if this element is currently notifying its descedant elements of
       * resize.
       */
      _notifyingDescendant: {
        type: Boolean,
        value: false
      }
    },

    listeners: {
      'iron-request-resize-notifications': '_onIronRequestResizeNotifications'
    },

    created: function() {
      // We don't really need property effects on these, and also we want them
      // to be created before the `_parentResizable` observer fires:
      this._interestedResizables = [];
      this._boundNotifyResize = this.notifyResize.bind(this);
    },

    attached: function() {
      this.fire('iron-request-resize-notifications', null, {
        node: this,
        bubbles: true,
        cancelable: true
      });

      if (!this._parentResizable) {
        window.addEventListener('resize', this._boundNotifyResize);
        this.notifyResize();
      }
    },

    detached: function() {
      if (this._parentResizable) {
        this._parentResizable.stopResizeNotificationsFor(this);
      } else {
        window.removeEventListener('resize', this._boundNotifyResize);
      }

      this._parentResizable = null;
    },

    /**
     * Can be called to manually notify a resizable and its descendant
     * resizables of a resize change.
     */
    notifyResize: function() {
      if (!this.isAttached) {
        return;
      }

      this._interestedResizables.forEach(function(resizable) {
        if (this.resizerShouldNotify(resizable)) {
          this._notifyDescendant(resizable);
        }
      }, this);

      this._fireResize();
    },

    /**
     * Used to assign the closest resizable ancestor to this resizable
     * if the ancestor detects a request for notifications.
     */
    assignParentResizable: function(parentResizable) {
      this._parentResizable = parentResizable;
    },

    /**
     * Used to remove a resizable descendant from the list of descendants
     * that should be notified of a resize change.
     */
    stopResizeNotificationsFor: function(target) {
      var index = this._interestedResizables.indexOf(target);

      if (index > -1) {
        this._interestedResizables.splice(index, 1);
        this.unlisten(target, 'iron-resize', '_onDescendantIronResize');
      }
    },

    /**
     * This method can be overridden to filter nested elements that should or
     * should not be notified by the current element. Return true if an element
     * should be notified, or false if it should not be notified.
     *
     * @param {HTMLElement} element A candidate descendant element that
     * implements `IronResizableBehavior`.
     * @return {boolean} True if the `element` should be notified of resize.
     */
    resizerShouldNotify: function(element) { return true; },

    _onDescendantIronResize: function(event) {
      if (this._notifyingDescendant) {
        event.stopPropagation();
        return;
      }

      // NOTE(cdata): In ShadowDOM, event retargetting makes echoing of the
      // otherwise non-bubbling event "just work." We do it manually here for
      // the case where Polymer is not using shadow roots for whatever reason:
      if (!Polymer.Settings.useShadow) {
        this._fireResize();
      }
    },

    _fireResize: function() {
      this.fire('iron-resize', null, {
        node: this,
        bubbles: false
      });
    },

    _onIronRequestResizeNotifications: function(event) {
      var target = event.path ? event.path[0] : event.target;

      if (target === this) {
        return;
      }

      if (this._interestedResizables.indexOf(target) === -1) {
        this._interestedResizables.push(target);
        this.listen(target, 'iron-resize', '_onDescendantIronResize');
      }

      target.assignParentResizable(this);
      this._notifyDescendant(target);

      event.stopPropagation();
    },

    _parentResizableChanged: function(parentResizable) {
      if (parentResizable) {
        window.removeEventListener('resize', this._boundNotifyResize);
      }
    },

    _notifyDescendant: function(descendant) {
      // NOTE(cdata): In IE10, attached is fired on children first, so it's
      // important not to notify them if the parent is not attached yet (or
      // else they will get redundantly notified when the parent attaches).
      if (!this.isAttached) {
        return;
      }

      this._notifyingDescendant = true;
      descendant.notifyResize();
      this._notifyingDescendant = false;
    }
  };
(function() {
'use strict';

  Polymer({

    is: 'iron-overlay-backdrop',

    properties: {

      /**
       * Returns true if the backdrop is opened.
       */
      opened: {
        reflectToAttribute: true,
        type: Boolean,
        value: false,
        observer: '_openedChanged'
      }

    },

    listeners: {
      'transitionend': '_onTransitionend'
    },

    created: function() {
      // Used to cancel previous requestAnimationFrame calls when opened changes.
      this.__openedRaf = null;
    },

    attached: function() {
      this.opened && this._openedChanged(this.opened);
    },

    /**
     * Appends the backdrop to document body if needed.
     */
    prepare: function() {
      if (this.opened && !this.parentNode) {
        Polymer.dom(document.body).appendChild(this);
      }
    },

    /**
     * Shows the backdrop.
     */
    open: function() {
      this.opened = true;
    },

    /**
     * Hides the backdrop.
     */
    close: function() {
      this.opened = false;
    },

    /**
     * Removes the backdrop from document body if needed.
     */
    complete: function() {
      if (!this.opened && this.parentNode === document.body) {
        Polymer.dom(this.parentNode).removeChild(this);
      }
    },

    _onTransitionend: function(event) {
      if (event && event.target === this) {
        this.complete();
      }
    },

    /**
     * @param {boolean} opened
     * @private
     */
    _openedChanged: function(opened) {
      if (opened) {
        // Auto-attach.
        this.prepare();
      } else {
        // Animation might be disabled via the mixin or opacity custom property.
        // If it is disabled in other ways, it's up to the user to call complete.
        var cs = window.getComputedStyle(this);
        if (cs.transitionDuration === '0s' || cs.opacity == 0) {
          this.complete();
        }
      }

      if (!this.isAttached) {
        return;
      }

      // Always cancel previous requestAnimationFrame.
      if (this.__openedRaf) {
        window.cancelAnimationFrame(this.__openedRaf);
        this.__openedRaf = null;
      }
      // Force relayout to ensure proper transitions.
      this.scrollTop = this.scrollTop;
      this.__openedRaf = window.requestAnimationFrame(function() {
        this.__openedRaf = null;
        this.toggleClass('opened', this.opened);
      }.bind(this));
    }
  });

})();
/**
   * @struct
   * @constructor
   * @private
   */
  Polymer.IronOverlayManagerClass = function() {
    /**
     * Used to keep track of the opened overlays.
     * @private {Array<Element>}
     */
    this._overlays = [];

    /**
     * iframes have a default z-index of 100,
     * so this default should be at least that.
     * @private {number}
     */
    this._minimumZ = 101;

    /**
     * Memoized backdrop element.
     * @private {Element|null}
     */
    this._backdropElement = null;

    // Enable document-wide tap recognizer.
    Polymer.Gestures.add(document, 'tap', this._onCaptureClick.bind(this));

    document.addEventListener('focus', this._onCaptureFocus.bind(this), true);
    document.addEventListener('keydown', this._onCaptureKeyDown.bind(this), true);
  };

  Polymer.IronOverlayManagerClass.prototype = {

    constructor: Polymer.IronOverlayManagerClass,

    /**
     * The shared backdrop element.
     * @type {!Element} backdropElement
     */
    get backdropElement() {
      if (!this._backdropElement) {
        this._backdropElement = document.createElement('iron-overlay-backdrop');
      }
      return this._backdropElement;
    },

    /**
     * The deepest active element.
     * @type {!Element} activeElement the active element
     */
    get deepActiveElement() {
      // document.activeElement can be null
      // https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
      // In case of null, default it to document.body.
      var active = document.activeElement || document.body;
      while (active.root && Polymer.dom(active.root).activeElement) {
        active = Polymer.dom(active.root).activeElement;
      }
      return active;
    },

    /**
     * Brings the overlay at the specified index to the front.
     * @param {number} i
     * @private
     */
    _bringOverlayAtIndexToFront: function(i) {
      var overlay = this._overlays[i];
      if (!overlay) {
        return;
      }
      var lastI = this._overlays.length - 1;
      var currentOverlay = this._overlays[lastI];
      // Ensure always-on-top overlay stays on top.
      if (currentOverlay && this._shouldBeBehindOverlay(overlay, currentOverlay)) {
        lastI--;
      }
      // If already the top element, return.
      if (i >= lastI) {
        return;
      }
      // Update z-index to be on top.
      var minimumZ = Math.max(this.currentOverlayZ(), this._minimumZ);
      if (this._getZ(overlay) <= minimumZ) {
        this._applyOverlayZ(overlay, minimumZ);
      }

      // Shift other overlays behind the new on top.
      while (i < lastI) {
        this._overlays[i] = this._overlays[i + 1];
        i++;
      }
      this._overlays[lastI] = overlay;
    },

    /**
     * Adds the overlay and updates its z-index if it's opened, or removes it if it's closed.
     * Also updates the backdrop z-index.
     * @param {!Element} overlay
     */
    addOrRemoveOverlay: function(overlay) {
      if (overlay.opened) {
        this.addOverlay(overlay);
      } else {
        this.removeOverlay(overlay);
      }
    },

    /**
     * Tracks overlays for z-index and focus management.
     * Ensures the last added overlay with always-on-top remains on top.
     * @param {!Element} overlay
     */
    addOverlay: function(overlay) {
      var i = this._overlays.indexOf(overlay);
      if (i >= 0) {
        this._bringOverlayAtIndexToFront(i);
        this.trackBackdrop();
        return;
      }
      var insertionIndex = this._overlays.length;
      var currentOverlay = this._overlays[insertionIndex - 1];
      var minimumZ = Math.max(this._getZ(currentOverlay), this._minimumZ);
      var newZ = this._getZ(overlay);

      // Ensure always-on-top overlay stays on top.
      if (currentOverlay && this._shouldBeBehindOverlay(overlay, currentOverlay)) {
        // This bumps the z-index of +2.
        this._applyOverlayZ(currentOverlay, minimumZ);
        insertionIndex--;
        // Update minimumZ to match previous overlay's z-index.
        var previousOverlay = this._overlays[insertionIndex - 1];
        minimumZ = Math.max(this._getZ(previousOverlay), this._minimumZ);
      }

      // Update z-index and insert overlay.
      if (newZ <= minimumZ) {
        this._applyOverlayZ(overlay, minimumZ);
      }
      this._overlays.splice(insertionIndex, 0, overlay);

      this.trackBackdrop();
    },

    /**
     * @param {!Element} overlay
     */
    removeOverlay: function(overlay) {
      var i = this._overlays.indexOf(overlay);
      if (i === -1) {
        return;
      }
      this._overlays.splice(i, 1);

      this.trackBackdrop();
    },

    /**
     * Returns the current overlay.
     * @return {Element|undefined}
     */
    currentOverlay: function() {
      var i = this._overlays.length - 1;
      return this._overlays[i];
    },

    /**
     * Returns the current overlay z-index.
     * @return {number}
     */
    currentOverlayZ: function() {
      return this._getZ(this.currentOverlay());
    },

    /**
     * Ensures that the minimum z-index of new overlays is at least `minimumZ`.
     * This does not effect the z-index of any existing overlays.
     * @param {number} minimumZ
     */
    ensureMinimumZ: function(minimumZ) {
      this._minimumZ = Math.max(this._minimumZ, minimumZ);
    },

    focusOverlay: function() {
      var current = /** @type {?} */ (this.currentOverlay());
      if (current) {
        current._applyFocus();
      }
    },

    /**
     * Updates the backdrop z-index.
     */
    trackBackdrop: function() {
      var overlay = this._overlayWithBackdrop();
      // Avoid creating the backdrop if there is no overlay with backdrop.
      if (!overlay && !this._backdropElement) {
        return;
      }
      this.backdropElement.style.zIndex = this._getZ(overlay) - 1;
      this.backdropElement.opened = !!overlay;
    },

    /**
     * @return {Array<Element>}
     */
    getBackdrops: function() {
      var backdrops = [];
      for (var i = 0; i < this._overlays.length; i++) {
        if (this._overlays[i].withBackdrop) {
          backdrops.push(this._overlays[i]);
        }
      }
      return backdrops;
    },

    /**
     * Returns the z-index for the backdrop.
     * @return {number}
     */
    backdropZ: function() {
      return this._getZ(this._overlayWithBackdrop()) - 1;
    },

    /**
     * Returns the first opened overlay that has a backdrop.
     * @return {Element|undefined}
     * @private
     */
    _overlayWithBackdrop: function() {
      for (var i = 0; i < this._overlays.length; i++) {
        if (this._overlays[i].withBackdrop) {
          return this._overlays[i];
        }
      }
    },

    /**
     * Calculates the minimum z-index for the overlay.
     * @param {Element=} overlay
     * @private
     */
    _getZ: function(overlay) {
      var z = this._minimumZ;
      if (overlay) {
        var z1 = Number(overlay.style.zIndex || window.getComputedStyle(overlay).zIndex);
        // Check if is a number
        // Number.isNaN not supported in IE 10+
        if (z1 === z1) {
          z = z1;
        }
      }
      return z;
    },

    /**
     * @param {!Element} element
     * @param {number|string} z
     * @private
     */
    _setZ: function(element, z) {
      element.style.zIndex = z;
    },

    /**
     * @param {!Element} overlay
     * @param {number} aboveZ
     * @private
     */
    _applyOverlayZ: function(overlay, aboveZ) {
      this._setZ(overlay, aboveZ + 2);
    },

    /**
     * Returns the deepest overlay in the path.
     * @param {Array<Element>=} path
     * @return {Element|undefined}
     * @suppress {missingProperties}
     * @private
     */
    _overlayInPath: function(path) {
      path = path || [];
      for (var i = 0; i < path.length; i++) {
        if (path[i]._manager === this) {
          return path[i];
        }
      }
    },

    /**
     * Ensures the click event is delegated to the right overlay.
     * @param {!Event} event
     * @private
     */
    _onCaptureClick: function(event) {
      var overlay = /** @type {?} */ (this.currentOverlay());
      // Check if clicked outside of top overlay.
      if (overlay && this._overlayInPath(Polymer.dom(event).path) !== overlay) {
        overlay._onCaptureClick(event);
      }
    },

    /**
     * Ensures the focus event is delegated to the right overlay.
     * @param {!Event} event
     * @private
     */
    _onCaptureFocus: function(event) {
      var overlay = /** @type {?} */ (this.currentOverlay());
      if (overlay) {
        overlay._onCaptureFocus(event);
      }
    },

    /**
     * Ensures TAB and ESC keyboard events are delegated to the right overlay.
     * @param {!Event} event
     * @private
     */
    _onCaptureKeyDown: function(event) {
      var overlay = /** @type {?} */ (this.currentOverlay());
      if (overlay) {
        if (Polymer.IronA11yKeysBehavior.keyboardEventMatchesKeys(event, 'esc')) {
          overlay._onCaptureEsc(event);
        } else if (Polymer.IronA11yKeysBehavior.keyboardEventMatchesKeys(event, 'tab')) {
          overlay._onCaptureTab(event);
        }
      }
    },

    /**
     * Returns if the overlay1 should be behind overlay2.
     * @param {!Element} overlay1
     * @param {!Element} overlay2
     * @return {boolean}
     * @suppress {missingProperties}
     * @private
     */
    _shouldBeBehindOverlay: function(overlay1, overlay2) {
      return !overlay1.alwaysOnTop && overlay2.alwaysOnTop;
    }
  };

  Polymer.IronOverlayManager = new Polymer.IronOverlayManagerClass();
(function() {
'use strict';

/**
Use `Polymer.IronOverlayBehavior` to implement an element that can be hidden or shown, and displays
on top of other content. It includes an optional backdrop, and can be used to implement a variety
of UI controls including dialogs and drop downs. Multiple overlays may be displayed at once.

See the [demo source code](https://github.com/PolymerElements/iron-overlay-behavior/blob/master/demo/simple-overlay.html)
for an example.

### Closing and canceling

An overlay may be hidden by closing or canceling. The difference between close and cancel is user
intent. Closing generally implies that the user acknowledged the content on the overlay. By default,
it will cancel whenever the user taps outside it or presses the escape key. This behavior is
configurable with the `no-cancel-on-esc-key` and the `no-cancel-on-outside-click` properties.
`close()` should be called explicitly by the implementer when the user interacts with a control
in the overlay element. When the dialog is canceled, the overlay fires an 'iron-overlay-canceled'
event. Call `preventDefault` on this event to prevent the overlay from closing.

### Positioning

By default the element is sized and positioned to fit and centered inside the window. You can
position and size it manually using CSS. See `Polymer.IronFitBehavior`.

### Backdrop

Set the `with-backdrop` attribute to display a backdrop behind the overlay. The backdrop is
appended to `<body>` and is of type `<iron-overlay-backdrop>`. See its doc page for styling
options.

In addition, `with-backdrop` will wrap the focus within the content in the light DOM.
Override the [`_focusableNodes` getter](#Polymer.IronOverlayBehavior:property-_focusableNodes)
to achieve a different behavior.

### Limitations

The element is styled to appear on top of other content by setting its `z-index` property. You
must ensure no element has a stacking context with a higher `z-index` than its parent stacking
context. You should place this element as a child of `<body>` whenever possible.

@demo demo/index.html
@polymerBehavior Polymer.IronOverlayBehavior
*/

  Polymer.IronOverlayBehaviorImpl = {

    properties: {

      /**
       * True if the overlay is currently displayed.
       */
      opened: {
        observer: '_openedChanged',
        type: Boolean,
        value: false,
        notify: true
      },

      /**
       * True if the overlay was canceled when it was last closed.
       */
      canceled: {
        observer: '_canceledChanged',
        readOnly: true,
        type: Boolean,
        value: false
      },

      /**
       * Set to true to display a backdrop behind the overlay. It traps the focus
       * within the light DOM of the overlay.
       */
      withBackdrop: {
        observer: '_withBackdropChanged',
        type: Boolean
      },

      /**
       * Set to true to disable auto-focusing the overlay or child nodes with
       * the `autofocus` attribute` when the overlay is opened.
       */
      noAutoFocus: {
        type: Boolean,
        value: false
      },

      /**
       * Set to true to disable canceling the overlay with the ESC key.
       */
      noCancelOnEscKey: {
        type: Boolean,
        value: false
      },

      /**
       * Set to true to disable canceling the overlay by clicking outside it.
       */
      noCancelOnOutsideClick: {
        type: Boolean,
        value: false
      },

      /**
       * Contains the reason(s) this overlay was last closed (see `iron-overlay-closed`).
       * `IronOverlayBehavior` provides the `canceled` reason; implementers of the
       * behavior can provide other reasons in addition to `canceled`.
       */
      closingReason: {
        // was a getter before, but needs to be a property so other
        // behaviors can override this.
        type: Object
      },

      /**
       * Set to true to enable restoring of focus when overlay is closed.
       */
      restoreFocusOnClose: {
        type: Boolean,
        value: false
      },

      /**
       * Set to true to keep overlay always on top.
       */
      alwaysOnTop: {
        type: Boolean
      },

      /**
       * Shortcut to access to the overlay manager.
       * @private
       * @type {Polymer.IronOverlayManagerClass}
       */
      _manager: {
        type: Object,
        value: Polymer.IronOverlayManager
      },

      /**
       * The node being focused.
       * @type {?Node}
       */
      _focusedChild: {
        type: Object
      }

    },

    listeners: {
      'iron-resize': '_onIronResize'
    },

    /**
     * The backdrop element.
     * @type {Element}
     */
    get backdropElement() {
      return this._manager.backdropElement;
    },

    /**
     * Returns the node to give focus to.
     * @type {Node}
     */
    get _focusNode() {
      return this._focusedChild || Polymer.dom(this).querySelector('[autofocus]') || this;
    },

    /**
     * Array of nodes that can receive focus (overlay included), ordered by `tabindex`.
     * This is used to retrieve which is the first and last focusable nodes in order
     * to wrap the focus for overlays `with-backdrop`.
     *
     * If you know what is your content (specifically the first and last focusable children),
     * you can override this method to return only `[firstFocusable, lastFocusable];`
     * @type {Array<Node>}
     * @protected
     */
    get _focusableNodes() {
      // Elements that can be focused even if they have [disabled] attribute.
      var FOCUSABLE_WITH_DISABLED = [
        'a[href]',
        'area[href]',
        'iframe',
        '[tabindex]',
        '[contentEditable=true]'
      ];

      // Elements that cannot be focused if they have [disabled] attribute.
      var FOCUSABLE_WITHOUT_DISABLED = [
        'input',
        'select',
        'textarea',
        'button'
      ];

      // Discard elements with tabindex=-1 (makes them not focusable).
      var selector = FOCUSABLE_WITH_DISABLED.join(':not([tabindex="-1"]),') +
        ':not([tabindex="-1"]),' +
        FOCUSABLE_WITHOUT_DISABLED.join(':not([disabled]):not([tabindex="-1"]),') +
        ':not([disabled]):not([tabindex="-1"])';

      var focusables = Polymer.dom(this).querySelectorAll(selector);
      if (this.tabIndex >= 0) {
        // Insert at the beginning because we might have all elements with tabIndex = 0,
        // and the overlay should be the first of the list.
        focusables.splice(0, 0, this);
      }
      // Sort by tabindex.
      return focusables.sort(function (a, b) {
        if (a.tabIndex === b.tabIndex) {
          return 0;
        }
        if (a.tabIndex === 0 || a.tabIndex > b.tabIndex) {
          return 1;
        }
        return -1;
      });
    },

    ready: function() {
      // Used to skip calls to notifyResize and refit while the overlay is animating.
      this.__isAnimating = false;
      // with-backdrop needs tabindex to be set in order to trap the focus.
      // If it is not set, IronOverlayBehavior will set it, and remove it if with-backdrop = false.
      this.__shouldRemoveTabIndex = false;
      // Used for wrapping the focus on TAB / Shift+TAB.
      this.__firstFocusableNode = this.__lastFocusableNode = null;
      // Used by __onNextAnimationFrame to cancel any previous callback.
      this.__raf = null;
      // Focused node before overlay gets opened. Can be restored on close.
      this.__restoreFocusNode = null;
      this._ensureSetup();
    },

    attached: function() {
      // Call _openedChanged here so that position can be computed correctly.
      if (this.opened) {
        this._openedChanged(this.opened);
      }
      this._observer = Polymer.dom(this).observeNodes(this._onNodesChange);
    },

    detached: function() {
      Polymer.dom(this).unobserveNodes(this._observer);
      this._observer = null;
      if (this.__raf) {
        window.cancelAnimationFrame(this.__raf);
        this.__raf = null;
      }
      this._manager.removeOverlay(this);
    },

    /**
     * Toggle the opened state of the overlay.
     */
    toggle: function() {
      this._setCanceled(false);
      this.opened = !this.opened;
    },

    /**
     * Open the overlay.
     */
    open: function() {
      this._setCanceled(false);
      this.opened = true;
    },

    /**
     * Close the overlay.
     */
    close: function() {
      this._setCanceled(false);
      this.opened = false;
    },

    /**
     * Cancels the overlay.
     * @param {Event=} event The original event
     */
    cancel: function(event) {
      var cancelEvent = this.fire('iron-overlay-canceled', event, {cancelable: true});
      if (cancelEvent.defaultPrevented) {
        return;
      }

      this._setCanceled(true);
      this.opened = false;
    },

    _ensureSetup: function() {
      if (this._overlaySetup) {
        return;
      }
      this._overlaySetup = true;
      this.style.outline = 'none';
      this.style.display = 'none';
    },

    /**
     * Called when `opened` changes.
     * @param {boolean=} opened
     * @protected
     */
    _openedChanged: function(opened) {
      if (opened) {
        this.removeAttribute('aria-hidden');
      } else {
        this.setAttribute('aria-hidden', 'true');
      }

      // Defer any animation-related code on attached
      // (_openedChanged gets called again on attached).
      if (!this.isAttached) {
        return;
      }

      this.__isAnimating = true;

      // Use requestAnimationFrame for non-blocking rendering.
      this.__onNextAnimationFrame(this.__openedChanged);
    },

    _canceledChanged: function() {
      this.closingReason = this.closingReason || {};
      this.closingReason.canceled = this.canceled;
    },

    _withBackdropChanged: function() {
      // If tabindex is already set, no need to override it.
      if (this.withBackdrop && !this.hasAttribute('tabindex')) {
        this.setAttribute('tabindex', '-1');
        this.__shouldRemoveTabIndex = true;
      } else if (this.__shouldRemoveTabIndex) {
        this.removeAttribute('tabindex');
        this.__shouldRemoveTabIndex = false;
      }
      if (this.opened && this.isAttached) {
        this._manager.trackBackdrop();
      }
    },

    /**
     * tasks which must occur before opening; e.g. making the element visible.
     * @protected
     */
    _prepareRenderOpened: function() {
      // Store focused node.
      this.__restoreFocusNode = this._manager.deepActiveElement;

      // Needed to calculate the size of the overlay so that transitions on its size
      // will have the correct starting points.
      this._preparePositioning();
      this.refit();
      this._finishPositioning();

      // Safari will apply the focus to the autofocus element when displayed
      // for the first time, so we make sure to return the focus where it was.
      if (this.noAutoFocus && document.activeElement === this._focusNode) {
        this._focusNode.blur();
        this.__restoreFocusNode.focus();
      }
    },

    /**
     * Tasks which cause the overlay to actually open; typically play an animation.
     * @protected
     */
    _renderOpened: function() {
      this._finishRenderOpened();
    },

    /**
     * Tasks which cause the overlay to actually close; typically play an animation.
     * @protected
     */
    _renderClosed: function() {
      this._finishRenderClosed();
    },

    /**
     * Tasks to be performed at the end of open action. Will fire `iron-overlay-opened`.
     * @protected
     */
    _finishRenderOpened: function() {
      this.notifyResize();
      this.__isAnimating = false;

      // Store it so we don't query too much.
      var focusableNodes = this._focusableNodes;
      this.__firstFocusableNode = focusableNodes[0];
      this.__lastFocusableNode = focusableNodes[focusableNodes.length - 1];

      this.fire('iron-overlay-opened');
    },

    /**
     * Tasks to be performed at the end of close action. Will fire `iron-overlay-closed`.
     * @protected
     */
    _finishRenderClosed: function() {
      // Hide the overlay.
      this.style.display = 'none';
      // Reset z-index only at the end of the animation.
      this.style.zIndex = '';
      this.notifyResize();
      this.__isAnimating = false;
      this.fire('iron-overlay-closed', this.closingReason);
    },

    _preparePositioning: function() {
      this.style.transition = this.style.webkitTransition = 'none';
      this.style.transform = this.style.webkitTransform = 'none';
      this.style.display = '';
    },

    _finishPositioning: function() {
      // First, make it invisible & reactivate animations.
      this.style.display = 'none';
      // Force reflow before re-enabling animations so that they don't start.
      // Set scrollTop to itself so that Closure Compiler doesn't remove this.
      this.scrollTop = this.scrollTop;
      this.style.transition = this.style.webkitTransition = '';
      this.style.transform = this.style.webkitTransform = '';
      // Now that animations are enabled, make it visible again
      this.style.display = '';
      // Force reflow, so that following animations are properly started.
      // Set scrollTop to itself so that Closure Compiler doesn't remove this.
      this.scrollTop = this.scrollTop;
    },

    /**
     * Applies focus according to the opened state.
     * @protected
     */
    _applyFocus: function() {
      if (this.opened) {
        if (!this.noAutoFocus) {
          this._focusNode.focus();
        }
      }
      else {
        this._focusNode.blur();
        this._focusedChild = null;
        // Restore focus.
        if (this.restoreFocusOnClose && this.__restoreFocusNode) {
          this.__restoreFocusNode.focus();
        }
        this.__restoreFocusNode = null;
        // If many overlays get closed at the same time, one of them would still
        // be the currentOverlay even if already closed, and would call _applyFocus
        // infinitely, so we check for this not to be the current overlay.
        var currentOverlay = this._manager.currentOverlay();
        if (currentOverlay && this !== currentOverlay) {
          currentOverlay._applyFocus();
        }
      }
    },

    /**
     * Cancels (closes) the overlay. Call when click happens outside the overlay.
     * @param {!Event} event
     * @protected
     */
    _onCaptureClick: function(event) {
      if (!this.noCancelOnOutsideClick) {
        this.cancel(event);
      }
    },

    /**
     * Keeps track of the focused child. If withBackdrop, traps focus within overlay.
     * @param {!Event} event
     * @protected
     */
    _onCaptureFocus: function (event) {
      if (!this.withBackdrop) {
        return;
      }
      var path = Polymer.dom(event).path;
      if (path.indexOf(this) === -1) {
        event.stopPropagation();
        this._applyFocus();
      } else {
        this._focusedChild = path[0];
      }
    },

    /**
     * Handles the ESC key event and cancels (closes) the overlay.
     * @param {!Event} event
     * @protected
     */
    _onCaptureEsc: function(event) {
      if (!this.noCancelOnEscKey) {
        this.cancel(event);
      }
    },

    /**
     * Handles TAB key events to track focus changes.
     * Will wrap focus for overlays withBackdrop.
     * @param {!Event} event
     * @protected
     */
    _onCaptureTab: function(event) {
      if (!this.withBackdrop) {
        return;
      }
      // TAB wraps from last to first focusable.
      // Shift + TAB wraps from first to last focusable.
      var shift = event.shiftKey;
      var nodeToCheck = shift ? this.__firstFocusableNode : this.__lastFocusableNode;
      var nodeToSet = shift ? this.__lastFocusableNode : this.__firstFocusableNode;
      var shouldWrap = false;
      if (nodeToCheck === nodeToSet) {
        // If nodeToCheck is the same as nodeToSet, it means we have an overlay
        // with 0 or 1 focusables; in either case we still need to trap the
        // focus within the overlay.
        shouldWrap = true;
      } else {
        // In dom=shadow, the manager will receive focus changes on the main
        // root but not the ones within other shadow roots, so we can't rely on
        // _focusedChild, but we should check the deepest active element.
        var focusedNode = this._manager.deepActiveElement;
        // If the active element is not the nodeToCheck but the overlay itself,
        // it means the focus is about to go outside the overlay, hence we
        // should prevent that (e.g. user opens the overlay and hit Shift+TAB).
        shouldWrap = (focusedNode === nodeToCheck || focusedNode === this);
      }

      if (shouldWrap) {
        // When the overlay contains the last focusable element of the document
        // and it's already focused, pressing TAB would move the focus outside
        // the document (e.g. to the browser search bar). Similarly, when the
        // overlay contains the first focusable element of the document and it's
        // already focused, pressing Shift+TAB would move the focus outside the
        // document (e.g. to the browser search bar).
        // In both cases, we would not receive a focus event, but only a blur.
        // In order to achieve focus wrapping, we prevent this TAB event and
        // force the focus. This will also prevent the focus to temporarily move
        // outside the overlay, which might cause scrolling.
        event.preventDefault();
        this._focusedChild = nodeToSet;
        this._applyFocus();
      }
    },

    /**
     * Refits if the overlay is opened and not animating.
     * @protected
     */
    _onIronResize: function() {
      if (this.opened && !this.__isAnimating) {
        this.__onNextAnimationFrame(this.refit);
      }
    },

    /**
     * Will call notifyResize if overlay is opened.
     * Can be overridden in order to avoid multiple observers on the same node.
     * @protected
     */
    _onNodesChange: function() {
      if (this.opened && !this.__isAnimating) {
        this.notifyResize();
      }
    },

    /**
     * Tasks executed when opened changes: prepare for the opening, move the
     * focus, update the manager, render opened/closed.
     * @private
     */
    __openedChanged: function() {
      if (this.opened) {
        // Make overlay visible, then add it to the manager.
        this._prepareRenderOpened();
        this._manager.addOverlay(this);
        // Move the focus to the child node with [autofocus].
        this._applyFocus();

        this._renderOpened();
      } else {
        // Remove overlay, then restore the focus before actually closing.
        this._manager.removeOverlay(this);
        this._applyFocus();

        this._renderClosed();
      }
    },

    /**
     * Executes a callback on the next animation frame, overriding any previous
     * callback awaiting for the next animation frame. e.g.
     * `__onNextAnimationFrame(callback1) && __onNextAnimationFrame(callback2)`;
     * `callback1` will never be invoked.
     * @param {!Function} callback Its `this` parameter is the overlay itself.
     * @private
     */
    __onNextAnimationFrame: function(callback) {
      if (this.__raf) {
        window.cancelAnimationFrame(this.__raf);
      }
      var self = this;
      this.__raf = window.requestAnimationFrame(function nextAnimationFrame() {
        self.__raf = null;
        callback.call(self);
      });
    }

  };

  /** @polymerBehavior */
  Polymer.IronOverlayBehavior = [Polymer.IronFitBehavior, Polymer.IronResizableBehavior, Polymer.IronOverlayBehaviorImpl];

  /**
   * Fired after the overlay opens.
   * @event iron-overlay-opened
   */

  /**
   * Fired when the overlay is canceled, but before it is closed.
   * @event iron-overlay-canceled
   * @param {Event} event The closing of the overlay can be prevented
   * by calling `event.preventDefault()`. The `event.detail` is the original event that
   * originated the canceling (e.g. ESC keyboard event or click event outside the overlay).
   */

  /**
   * Fired after the overlay closes.
   * @event iron-overlay-closed
   * @param {Event} event The `event.detail` is the `closingReason` property
   * (contains `canceled`, whether the overlay was canceled).
   */

})();
/**
Use `Polymer.PaperDialogBehavior` and `paper-dialog-shared-styles.html` to implement a Material Design
dialog.

For example, if `<paper-dialog-impl>` implements this behavior:

    <paper-dialog-impl>
        <h2>Header</h2>
        <div>Dialog body</div>
        <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button dialog-confirm>Accept</paper-button>
        </div>
    </paper-dialog-impl>

`paper-dialog-shared-styles.html` provide styles for a header, content area, and an action area for buttons.
Use the `<h2>` tag for the header and the `buttons` class for the action area. You can use the
`paper-dialog-scrollable` element (in its own repository) if you need a scrolling content area.

Use the `dialog-dismiss` and `dialog-confirm` attributes on interactive controls to close the
dialog. If the user dismisses the dialog with `dialog-confirm`, the `closingReason` will update
to include `confirmed: true`.

### Accessibility

This element has `role="dialog"` by default. Depending on the context, it may be more appropriate
to override this attribute with `role="alertdialog"`.

If `modal` is set, the element will prevent the focus from exiting the element.
It will also ensure that focus remains in the dialog.

@hero hero.svg
@demo demo/index.html
@polymerBehavior Polymer.PaperDialogBehavior
*/

  Polymer.PaperDialogBehaviorImpl = {

    hostAttributes: {
      'role': 'dialog',
      'tabindex': '-1'
    },

    properties: {

      /**
       * If `modal` is true, this implies `no-cancel-on-outside-click`, `no-cancel-on-esc-key` and `with-backdrop`.
       */
      modal: {
        type: Boolean,
        value: false
      }

    },

    observers: [
      '_modalChanged(modal, _readied)'
    ],

    listeners: {
      'tap': '_onDialogClick'
    },

    ready: function () {
      // Only now these properties can be read.
      this.__prevNoCancelOnOutsideClick = this.noCancelOnOutsideClick;
      this.__prevNoCancelOnEscKey = this.noCancelOnEscKey;
      this.__prevWithBackdrop = this.withBackdrop;
    },

    _modalChanged: function(modal, readied) {
      // modal implies noCancelOnOutsideClick, noCancelOnEscKey and withBackdrop.
      // We need to wait for the element to be ready before we can read the
      // properties values.
      if (!readied) {
        return;
      }

      if (modal) {
        this.__prevNoCancelOnOutsideClick = this.noCancelOnOutsideClick;
        this.__prevNoCancelOnEscKey = this.noCancelOnEscKey;
        this.__prevWithBackdrop = this.withBackdrop;
        this.noCancelOnOutsideClick = true;
        this.noCancelOnEscKey = true;
        this.withBackdrop = true;
      } else {
        // If the value was changed to false, let it false.
        this.noCancelOnOutsideClick = this.noCancelOnOutsideClick &&
          this.__prevNoCancelOnOutsideClick;
        this.noCancelOnEscKey = this.noCancelOnEscKey &&
          this.__prevNoCancelOnEscKey;
        this.withBackdrop = this.withBackdrop && this.__prevWithBackdrop;
      }
    },

    _updateClosingReasonConfirmed: function(confirmed) {
      this.closingReason = this.closingReason || {};
      this.closingReason.confirmed = confirmed;
    },

    /**
     * Will dismiss the dialog if user clicked on an element with dialog-dismiss
     * or dialog-confirm attribute.
     */
    _onDialogClick: function(event) {
      // Search for the element with dialog-confirm or dialog-dismiss,
      // from the root target until this (excluded).
      var path = Polymer.dom(event).path;
      for (var i = 0; i < path.indexOf(this); i++) {
        var target = path[i];
        if (target.hasAttribute && (target.hasAttribute('dialog-dismiss') || target.hasAttribute('dialog-confirm'))) {
          this._updateClosingReasonConfirmed(target.hasAttribute('dialog-confirm'));
          this.close();
          event.stopPropagation();
          break;
        }
      }
    }

  };

  /** @polymerBehavior */
  Polymer.PaperDialogBehavior = [Polymer.IronOverlayBehavior, Polymer.PaperDialogBehaviorImpl];
(function() {

  Polymer({

    is: 'paper-dialog',

    behaviors: [
      Polymer.PaperDialogBehavior,
      Polymer.NeonAnimationRunnerBehavior
    ],

    listeners: {
      'neon-animation-finish': '_onNeonAnimationFinish'
    },

    _renderOpened: function() {
      this.cancelAnimation();
      if (this.withBackdrop) {
        this.backdropElement.open();
      }
      this.playAnimation('entry');
    },

    _renderClosed: function() {
      this.cancelAnimation();
      if (this.withBackdrop) {
        this.backdropElement.close();
      }
      this.playAnimation('exit');
    },

    _onNeonAnimationFinish: function() {
      if (this.opened) {
        this._finishRenderOpened();
      } else {
        this._finishRenderClosed();
      }
    }

  });

})();
/** @polymerBehavior Polymer.PaperButtonBehavior */
  Polymer.PaperButtonBehaviorImpl = {
    properties: {
      /**
       * The z-depth of this element, from 0-5. Setting to 0 will remove the
       * shadow, and each increasing number greater than 0 will be "deeper"
       * than the last.
       *
       * @attribute elevation
       * @type number
       * @default 1
       */
      elevation: {
        type: Number,
        reflectToAttribute: true,
        readOnly: true
      }
    },

    observers: [
      '_calculateElevation(focused, disabled, active, pressed, receivedFocusFromKeyboard)',
      '_computeKeyboardClass(receivedFocusFromKeyboard)'
    ],

    hostAttributes: {
      role: 'button',
      tabindex: '0',
      animated: true
    },

    _calculateElevation: function() {
      var e = 1;
      if (this.disabled) {
        e = 0;
      } else if (this.active || this.pressed) {
        e = 4;
      } else if (this.receivedFocusFromKeyboard) {
        e = 3;
      }
      this._setElevation(e);
    },

    _computeKeyboardClass: function(receivedFocusFromKeyboard) {
      this.toggleClass('keyboard-focus', receivedFocusFromKeyboard);
    },

    /**
     * In addition to `IronButtonState` behavior, when space key goes down,
     * create a ripple down effect.
     *
     * @param {!KeyboardEvent} event .
     */
    _spaceKeyDownHandler: function(event) {
      Polymer.IronButtonStateImpl._spaceKeyDownHandler.call(this, event);
      // Ensure that there is at most one ripple when the space key is held down.
      if (this.hasRipple() && this.getRipple().ripples.length < 1) {
        this._ripple.uiDownAction();
      }
    },

    /**
     * In addition to `IronButtonState` behavior, when space key goes up,
     * create a ripple up effect.
     *
     * @param {!KeyboardEvent} event .
     */
    _spaceKeyUpHandler: function(event) {
      Polymer.IronButtonStateImpl._spaceKeyUpHandler.call(this, event);
      if (this.hasRipple()) {
        this._ripple.uiUpAction();
      }
    }
  };

  /** @polymerBehavior */
  Polymer.PaperButtonBehavior = [
    Polymer.IronButtonState,
    Polymer.IronControlState,
    Polymer.PaperRippleBehavior,
    Polymer.PaperButtonBehaviorImpl
  ];
(function(){
      function hsv2rgb(h, s, v){
        var c = v * s;
        var h1 = h / 60;
        var x = c * (1 - Math.abs((h1 % 2) - 1));
        var m = v - c;
        var rgb;
        if(typeof h == 'undefined') rgb = [0, 0, 0];
        else if(h1 < 1) rgb = [c, x, 0];
        else if(h1 < 2) rgb = [x, c, 0];
        else if(h1 < 3) rgb = [0, c, x];
        else if(h1 < 4) rgb = [0, x, c];
        else if(h1 < 5) rgb = [x, 0, c];
        else if(h1 <= 6) rgb = [c, 0, x];
        return [255 * (rgb[0] + m), 255 * (rgb[1] + m), 255 * (rgb[2] + m)];
      }

      function hsl2rgb(h, s, l){
        var r, g, b;
        h /= 360;
        if(s == 0){
          r = g = b = l; // achromatic
        }else{
          function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
      }
      function rgb2hsl(r, g, b){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min){
          h = s = 0;
        }else{
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }

        return [h, s, l];
      }
      var rgb2hsv = function(r,g,b) {
        var b, delta, g, h, max, min, r, s, v;
        min = Math.min(r, g, b);
        max = Math.max(r, g, b);
        delta = max - min;
        v = max / 255.0;
        if (max === 0) {
          h = Number.NaN;
          s = 0;
        } else {
          s = delta / max;
          if (r === max) {
            h = (g - b) / delta;
          }
          if (g === max) {
            h = 2 + (b - r) / delta;
          }
          if (b === max) {
            h = 4 + (r - g) / delta;
          }
          h *= 60;
          if (h < 0) {
            h += 360;
          }
        }
        return [h/360, s, v];
      };

      Polymer({
        is: 'paper-color-circle',
        properties: {
          /**
           * A AA border can be drawn to prevent jagged edges on circles
           *
           * @attribute colouredAaBorder
           * @type boolean
           * @default false
           */
          noAaBorder: {
            type: Boolean,
            value: false
          },
          _ctx: {
            type: Object,
            value: function(){
              return {};
            }
          },
          _domReady: {
            type: Boolean,
            value: false
          },
          _down: {
            type: Boolean,
            value: false
          },
          _moveStart: {
            type: Boolean,
            value: false
          },
          _redrawTimer: {
            type: Number,
            value: 0
          },
          _setAaBorder: {
            value: function(){
              return undefined;
            }
          },
          /**
           * Picked color
           *
           * @attribute color
           * @type Array
           * @default new Array(2)
           */
          color: {
            type: Object,
            notify: true,
            value: {
              red: undefined,
              green: undefined,
              blue: undefined
            }
          },
          /**
           * A coloured AA border can be drawn to prevent jagged edges on circles
           *
           * @attribute colouredAaBorder
           * @type Array
           * @default false
           */
          colouredAaBorder: {
            type: Boolean,
            value: false,
            notify: true
          },
          hsl2rgb: {
            value: function(){
              return hsl2rgb;
            }
          },
          rgb2hsl: {
            value: function(){
              return rgb2hsl;
            }
          },
          hsv2rgb: {
            value: function(){
              return hsv2rgb;
            }
          },
          rgb2hsv: {
            value: function(){
              return rgb2hsv;
            }
          },
          /**
           * In case of a huebox, the hue from 0 to 1
           *
           * @attribute value
           * @type number
           * @default 1
           */
          hue: {
            type: Number,
            value: 0,
            notify: true,
            observer: 'hueChanged'
          },
          /**
           * In case of hsl, the lightness
           *
           * @attribute lightness
           * @type number
           * @default .5
           */
          lightness: {
            type: Number,
            value: 0.5,
            notify: true,
            observer: 'lightnessChanged'
          },
          /**
           * square, circle or huebox
           *
           * @attribute shape
           * @type string
           * @default 'circle'
           */
          shape: {
            type: String,
            value: 'circle',
            notify: true
          },
          /**
           * hsv OR hsl
           *
           * @attribute type
           * @type string
           * @default 'hsv'
           */
          type: {
            type: String,
            value: 'hsv',
            notify: true
          },
          /**
           * In case of hsv, the value
           *
           * @attribute value
           * @type number
           * @default 1
           */
          value: {
            type: Number,
            value: 1,
            notify: true,
            observer: 'valueChanged'
          }
        },
        observers: [
          'colorChanged(color.*)'
        ],
        behaviors: [
          Polymer.IronResizableBehavior
        ],
        listeners: {
          'iron-resize': 'redraw'
        },
        pickColor: function(e){
          var rect = this.getBoundingClientRect();
          var touchX = e.detail.x - rect.left;
          var touchY = e.detail.y - rect.top;
          var color = this._ctx.getImageData(touchX, touchY, 1, 1).data;
          if(this.shape === 'circle'){
            var distance = Math.abs(Math.sqrt(Math.pow(touchX-this.size/2, 2) + Math.pow(touchY-this.size/2, 2))-this.size/2);
            if(distance < this.size/100){
              return;
            }
          }
          if(color[3] > 0 && color[3] == 255){
            this.set('color.red', color[0]);
            this.set('color.green', color[1]);
            this.set('color.blue', color[2]);
            if(!this.noAaBorder && this.colouredAaBorder)
              this.redraw();
          }
        },
        onDown: function(e){
          this.pickColor(e, true);
          this._trackingColorChanges = true;
        },
        onMove: function(e){
          this.pickColor(e);
        },
        onUp: function(e){
          this._trackingColorChanges = false;
          this.$.ripple.style.color = 'rgb(' + this.color['red'] + ',' + this.color['green'] + ',' + this.color['blue'] + ')';

          this.$.ripple.downAction(e);
          this.async(function(){
            this.$.ripple.upAction();
          })
        },
        redraw: function(){
          this.debounce('redraw', function(){
            var size = this.getBoundingClientRect();
            var width = size.width;
            var height = size.height;
            if(width == 0 || height == 0){
              var computedStyle = window.getComputedStyle(this);
              width = parseInt(computedStyle.width);
              height = parseInt(computedStyle.height);
            }
            this.size = Math.min(width, height);
            this.$.canvas.width = this.size;
            this.$.canvas.height = this.size;
            this.$.rippleContainer.style.width = this.size + 'px';
            this.$.rippleContainer.style.height = this.size + 'px';

            var halfsize = this.size/2;
            var bitmap = this._ctx.getImageData(0, 0, this.size, this.size);
            var smoothBorder = 0;
            for (var y = 0; y < this.size; y++){
              for (var x = 0; x < this.size; x++){

                // offset for the 4 RGBA values in the data array
                var offset = 4 * ((y * this.size) + x);

                if(this.shape === 'circle'){
                  var distanceFromCenter = Math.sqrt(Math.pow(y - halfsize, 2) + Math.pow(x - halfsize, 2)) / halfsize;
                  if(distanceFromCenter < (halfsize+smoothBorder)/halfsize - 0.01){
                    var hue = Math.atan2(y - halfsize, x - halfsize) * (180 / Math.PI);
                    if(hue < 0) hue+=360;
                    var saturation = Math.round(distanceFromCenter*1000)/1000;
                    saturation = Math.min(1, saturation);
                    if(this.type === 'hsv'){
                      var value = Math.round(this.value*1000)/1000;
                      var color = hsv2rgb(hue, saturation, value);
                    }else if(this.type === 'hsl'){
                      var lightness = Math.round(this.lightness*1000)/1000;
                      var color = hsl2rgb(hue, saturation, lightness);
                    }

                    // fill RGBA values
                    bitmap.data[offset + 0] = color[0];
                    bitmap.data[offset + 1] = color[1];
                    bitmap.data[offset + 2] = color[2];
                    if(distanceFromCenter - 1 >= 0){
                      var distance = Math.round((distanceFromCenter - 1)*halfsize);

                      bitmap.data[offset + 3] = 255*((smoothBorder-distance)/smoothBorder); // transparency
                    }else{
                      bitmap.data[offset + 3] = 255; // no transparency
                    }
                  };
                }else if(this.shape === 'huebox'){
                  var saturation = x/width;
                  var hue = Math.round(this.hue*1000)/1000*360;
                  var third = 1-y/this.size;
                  if(this.type === 'hsv'){
                    var color = hsv2rgb(hue, saturation, third);
                  }else if(this.type === 'hsl'){
                    var color = hsl2rgb(hue, saturation, third);
                  }
                  bitmap.data[offset + 0] = color[0];
                  bitmap.data[offset + 1] = color[1];
                  bitmap.data[offset + 2] = color[2];
                  bitmap.data[offset + 3] = 255; // no transparency
                }else if(this.shape === 'square'){
                  var hue = x/width*360;
                  var saturation = 1-y/this.size;
                  if(this.type === 'hsv'){
                    var value = Math.round(this.value*1000)/1000;
                    var color = hsv2rgb(hue, saturation, value);
                  }else if(this.type === 'hsl'){
                    var lightness = Math.round(this.lightness*1000)/1000;
                    var color = hsl2rgb(hue, saturation, lightness);
                  }
                  bitmap.data[offset + 0] = color[0];
                  bitmap.data[offset + 1] = color[1];
                  bitmap.data[offset + 2] = color[2];
                  bitmap.data[offset + 3] = 255; // no transparency
                }

              };
            };
            this._ctx.putImageData(bitmap, 0, 0);
            if(!this.noAaBorder && this.shape === 'circle'){
              //Getting a nice anti aliased edge using canvas is hard, so instead a white circle is draw over the border
              this.drawAACircle();
            }
          });
        },
        drawAACircle: function(){
          if(this.colouredAaBorder){
            if(this.color['green']){
              this.set('_ctx.strokeStyle', 'rgb(' + this.color['red'] + ',' + this.color['green'] + ',' + this.color['blue'] + ')');
            } else {
              this.set('_ctx.strokeStyle', 'rgb(' + this.colouredAaBorder[0] + ',' + this.colouredAaBorder[1] + ',' + this.colouredAaBorder[2] + ')');
            }
          } else {
            this.set('_ctx.strokeStyle', 'rgba(255,255,255,.99)');
          }
          this.set('_ctx.lineWidth', this.size/100);
          this._ctx.beginPath();
          var borderRadius = this.size / 2;
          this._ctx.arc(this.size / 2, this.size / 2, borderRadius - 1, 0, 2 * Math.PI, false);
          this._ctx.closePath();
          this._ctx.stroke();
        },
        valueChanged: function(){
          if(this._domReady)
            this.redraw();
        },
        lightnessChanged: function(){
          if(this._domReady)
            this.redraw();
        },
        hueChanged: function(){
          if(this._domReady)
            this.redraw();
        },
        colorChanged: function(){
          if(!this._trackingColorChanges){
            if(this.type == 'hsl'){
              var hsl = this.rgb2hsl(parseInt(this.color.red), parseInt(this.color.green), parseInt(this.color.blue));
              this.hue = hsl[0];
              this.lightness = hsl[2];
            }else if(this.type == 'hsv'){
              var hsv = this.rgb2hsv(parseInt(this.color.red), parseInt(this.color.green), parseInt(this.color.blue));
              if(!isNaN(hsv[0])) this.hue = hsv[0];
              this.value = hsv[2];
            }
          }
          //if(this._domReady)
          //  this.redraw();
        },
        attached: function(){
          this._domReady = true;
          this._ctx = this.$.canvas.getContext('2d');
          this.redraw();
        }
      });
    }());
var Whenever = function(){
	var callbacks = [];
	var ready = false;
	var args;
	return {
		get state(){
			return {
				ready: ready,
				args: args,
				pendingCallbacks: callbacks.length
			};
		},
		ready: function(){
			args = arguments;
			callbacks.forEach(function(callback){
				callback.apply(this, args);
			});
			callbacks = [];
			ready = true;
		},
		whenReady: function(callback){
			if(ready){
				callback.apply(this, args);
			}else{
				callbacks.push(callback);
			}
		}
	}
};
(function(){
      var colorNamesRetrieved = new Whenever();
      var retrievingColorNames = false;
      var retrieveColorNames = function(el){
        if(!retrievingColorNames){
          var httpRequest = new XMLHttpRequest();
          httpRequest.onreadystatechange = function(){
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {
                colorNamesRetrieved.ready(JSON.parse(httpRequest.responseText));
              }
            }
          };
          httpRequest.open('GET', el.resolveUrl('./color-names.json'));
          httpRequest.send();
        }
        retrievingColorNames = true;
        return colorNamesRetrieved;
      };

      Polymer({
        is: 'paper-color-picker',
        properties: {
          /**
           * The selected color as an object: `{red, green, blue}`
           *
           * @attribute color
           * @type Object
           * @default new Object()
           */
          color: {
            type: Object,
            value: {
              red: undefined,
              green: undefined,
              blue: undefined,
              alpha: 1
            },
            notify: true
          },
          colorHue: {
            type: Number,
            value: 0
          },
          colorLightness: {
            type: Number,
            value: 0.5
          },
          colorValue: {
            type: Number,
            value: 1
          },
          disableUpdate: {
            type: Boolean,
            value: false
          },
          /**
           * Show alpha slider always instead of only in the advanced settings
           */
          alwaysShowAlpha: Boolean,
          /**
           * Whether to allow changing the transparency of the picked color
           */
          allowAlpha: Boolean,
          /**
           * The selected color as an object: `{red, green, blue}`
           * even before the user clicks ok
           *
           * @attribute immediateColor
           * @type Object
           * @default {red: 50, green: 50, blue: 50}
           */
          immediateColor: {
            type: Object,
            value: {
              red: 0,
              green: 150,
              blue: 136,
              alpha: 1
            },
            notify: true
          },
          /**
           * *square*, *circle* or *huebox*
           *
           * @attribute shape
           * @type string
           * @default 'circle'
           */
          shape: {
            type: String,
            value: 'circle',
            notify: true
          },
          sliderHue: {
            type: Number,
            value: 50
          },
          sliderLightness: {
            type: Number,
            value: 50,
            observer: 'sliderLightnessChanged'
          },
          sliderValue: {
            type: Number,
            value: 100,
            observer: 'sliderValueChanged'
          },
          /**
           * *hsv* or *hsl*
           *
           * @attribute type
           * @type string
           * @default 'hsv'
           */
          type: {
            type: String,
            value: 'hsv',
            notify: true
          },
          noFullNames: {
            type: Boolean
          },
          immediateColorAsString: {
            type: String,
            notify: true
          },
          colorAsString: {
            type: String,
            notify: true
          },
          advanced: {
            type: Boolean,
            reflectToAttribute: true,
            observer: '_recenterDialog'
          }
        },
        observers: [
          'immediateColorChanged(immediateColor.*)'
        ],
        ready: function(){
          if(!this.advanced){
            this.set('advanced', false);
          }
          if(!this.alwaysShowAlpha){
            this.set('alwaysShowAlpha', false);
          }
          if(!this.noFullNames){
            this.set('noFullNames', false);
            retrieveColorNames(this);
          }
          this.async(function(){
            if(this._isColorDefined()){
              if(this.allowAlpha && typeof this.color.alpha !== 'undefined'){
                this._initialAlphaValueHack = this.color.alpha;
              }else{
                this._initialAlphaValueHack = 1;
              }
            }else if(this._isImmediateColorDefined()){
              if(this.allowAlpha && typeof this.immediateColor.alpha !== 'undefined'){
                this._initialAlphaValueHack = this.immediateColor.alpha;
              }else{
                this._initialAlphaValueHack = 1;
              }
            }else{
              this._initialAlphaValueHack = 1;
            }
            this._initialAlphaValueHackApplied = true;
          });
          window.addEventListener('resize', function(){
            this.$.dialog.resetFit();
          }.bind(this));
        },
        _and: function(a,b){
          return a && b;
        },
        _or: function(a,b){
          return a || b;
        },
        _isColorDefined: function(){
          return this.color.red >= 0 && this.color.green >= 0 && this.color.blue >= 0;
        },
        _isImmediateColorDefined: function(){
          return this.immediateColor.red >= 0 && this.immediateColor.green >= 0 && this.immediateColor.blue >= 0;
        },
        setColorWheel: function(){
          if (!this.disableUpdate){
            if(this._showValueSlider()){
              this.set('colorValue', this.sliderValue / 100);
            }
            if(this._showLightnessSlider())
              this.colorLightness = this.sliderLightness / 100;

            setTimeout(function(){
              this.disableUpdate = false;
            }.bind(this), 50);
          }
          this.disableUpdate = true;
        },
        sliderValueChanged: function(){
          this.setColorWheel();
        },
        sliderLightnessChanged: function(){
          this.setColorWheel();
        },
        _calculateLuminance: function(r, g, b){
          var a = [r,g,b].map(function(v) {
            v /= 255;
            return (v <= 0.03928) ?
            v / 12.92 :
                    Math.pow( ((v+0.055)/1.055), 2.4 );
          });
          return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        },
        immediateColorChanged: function(){
          if(typeof this.immediateColor.alpha == 'undefined'){
            this.immediateColor.alpha = 1;
          }
          this.$.color.style.backgroundColor = 'rgba(' + this.immediateColor['red'] + ',' + this.immediateColor['green'] + ',' + this.immediateColor['blue'] + ',' + this.immediateColor['alpha'] + ')';
          if(!this.noFullNames){
            colorNamesRetrieved.whenReady(function(colors){
              var closest = {
                color: undefined,
                distance: Infinity
              };
              colors.forEach((color) => {
                var distance = Math.sqrt(Math.pow(this.immediateColor['red']-color.rgb[0],2)+Math.pow(this.immediateColor['green']-color.rgb[1],2)+Math.pow(this.immediateColor['blue']-color.rgb[2],2));
                if(distance < closest.distance){
                  closest.color = color;
                  closest.distance = distance;
                }
              });
              this.immediateColorAsString = closest.color.title;

              var luminance = Math.max(this._calculateLuminance.apply(this, closest.color.rgb), Math.min(1,1-this.immediateColor.alpha+0.2));
              //shy: ­
              var opacity = Math.max(0,luminance -.5) *1.8;
              opacity = Math.round(opacity*100)/100;
              this.$.title.style.textShadow = 'rgba(0,0,0,'+ opacity +') 1px 0 60px';
              //this.$.title.style.opacity = luminance < 0.6 ? .9 : 0.5;
            }.bind(this));
          }
          //var maxZ = Math.max.bind(Math, 0);
          //this.$.title.style.backgroundColor = 'rgb(' + maxZ(this.immediateColor['red'] - 40) + ',' + maxZ(this.immediateColor['green'] - 40) + ',' + maxZ(this.immediateColor['blue'] - 40) + ')';
        },
        drawHuePicker: function(){
          this._huePickerCtx = Polymer.dom(this.root).querySelector('#huePicker').getContext('2d');
          var bitmap = this._huePickerCtx.getImageData(0, 0, 360, 30);
          for (var x = 0; x < 360; x++){
            var hue = x;
            var color = this.$.picker.hsv2rgb(hue, 1, 1);
            bitmap.data[4 * x + 0] = color[0];
            bitmap.data[4 * x + 1] = color[1];
            bitmap.data[4 * x + 2] = color[2];
            bitmap.data[4 * x + 3] = 255;
          }
          this._huePickerCtx.putImageData(bitmap, 0, 0);
        },
        huePickerPickColor: function(e){
          var rect = Polymer.dom(this.root).querySelector('#huePicker').getBoundingClientRect();
          var percentage = (e.detail.x - rect.left) / rect.width;
          if(percentage > 0 && percentage < 1)
            this.colorHue = percentage;
        },
        changeColorMixture: function(){
          var red = this.$.redField.value;
          var green = this.$.greenField.value;
          var blue = this.$.blueField.value;
          var colors = {
            red: red,
            green: green,
            blue: blue
          };
          this.set('immediateColor', colors);
        },
        setColor: function(){
          this.set('color.red', this.immediateColor.red);
          this.set('color.green', this.immediateColor.green);
          this.set('color.blue', this.immediateColor.blue);
          this.set('color.alpha', this.immediateColor.alpha);
          this.set('colorAsString', this.immediateColorAsString);
        },
        open: function(){
          if (this.color && this.color['green'])
            this.immediateColor = this.color;
          this.immediateColorChanged();
          this.$.dialog.open();
          if (this._showHuePicker())
            this.drawHuePicker();
        },
        _computeColouredaaborder: function(){
          return {
            red: 50,
            green: 50,
            blue: 50
          };
        },
        _showValueSlider: function(){
          return this.type == 'hsv' && this.shape !== 'huebox';
        },
        _showLightnessSlider: function(){
          return this.type == 'hsl' && this.shape !== 'huebox';
        },
        _showHuePicker: function(){
          return this.shape == 'huebox';
        },
        toggleAdvancedMode: function(){
          this.advanced = !this.advanced;
        },
        _recenterDialog: function(){
          if(this.$.dialog.opened)
            this.$.dialog.center();
        },
        _setSliders: function(){
          this.async(function(){
            var valueSlider = Polymer.dom(this.root).querySelector('#valueSlider');
            if(valueSlider){
              valueSlider.set('value', this.colorValue*100);
            }
            var lightnessSlider = Polymer.dom(this.root).querySelector('#lightnessSlider');
            if(lightnessSlider){
              lightnessSlider.set('value', this.colorLightness*100);
            }
          });

        }
      });
    })();
Polymer({

    is: 'paper-dialog-scrollable',

    properties: {

      /**
       * The dialog element that implements `Polymer.PaperDialogBehavior` containing this element.
       * @type {?Node}
       */
      dialogElement: {
        type: Object
      }

    },

    listeners: {
      'scrollable.scroll': '_scroll'
    },

    /**
     * Returns the scrolling element.
     */
    get scrollTarget() {
      return this.$.scrollable;
    },

    ready: function () {
      this._ensureTarget();
    },

    attached: function() {
      this.classList.add('no-padding');
      this._ensureTarget();
      requestAnimationFrame(this._scroll.bind(this));
    },

    _scroll: function() {
      this.toggleClass('is-scrolled', this.scrollTarget.scrollTop > 0);
      this.toggleClass('can-scroll', this.scrollTarget.offsetHeight < this.scrollTarget.scrollHeight);
      this.toggleClass('scrolled-to-bottom',
        this.scrollTarget.scrollTop + this.scrollTarget.offsetHeight >= this.scrollTarget.scrollHeight);
    },

    _ensureTarget: function () {
      // read parentNode on attached because if dynamically created,
      // parentNode will be null on creation.
      this.dialogElement = this.dialogElement || Polymer.dom(this).parentNode;
      // Check if parent implements paper-dialog-behavior. If not, fit scrollTarget to host.
      if (this.dialogElement && this.dialogElement.behaviors &&
          this.dialogElement.behaviors.indexOf(Polymer.PaperDialogBehaviorImpl) >= 0) {
        this.dialogElement.sizingTarget = this.scrollTarget;
        this.scrollTarget.classList.remove('fit');
      } else if (this.dialogElement) {
        this.scrollTarget.classList.add('fit');
      }
    }

  });
(function() {
    'use strict';
    // Used to calculate the scroll direction during touch events.
    var LAST_TOUCH_POSITION = {
      pageX: 0,
      pageY: 0
    };
    // Used to avoid computing event.path and filter scrollable nodes (better perf).
    var ROOT_TARGET = null;
    var SCROLLABLE_NODES = [];

    /**
     * The IronDropdownScrollManager is intended to provide a central source
     * of authority and control over which elements in a document are currently
     * allowed to scroll.
     */

    Polymer.IronDropdownScrollManager = {

      /**
       * The current element that defines the DOM boundaries of the
       * scroll lock. This is always the most recently locking element.
       */
      get currentLockingElement() {
        return this._lockingElements[this._lockingElements.length - 1];
      },

      /**
       * Returns true if the provided element is "scroll locked", which is to
       * say that it cannot be scrolled via pointer or keyboard interactions.
       *
       * @param {HTMLElement} element An HTML element instance which may or may
       * not be scroll locked.
       */
      elementIsScrollLocked: function(element) {
        var currentLockingElement = this.currentLockingElement;

        if (currentLockingElement === undefined)
          return false;

        var scrollLocked;

        if (this._hasCachedLockedElement(element)) {
          return true;
        }

        if (this._hasCachedUnlockedElement(element)) {
          return false;
        }

        scrollLocked = !!currentLockingElement &&
          currentLockingElement !== element &&
          !this._composedTreeContains(currentLockingElement, element);

        if (scrollLocked) {
          this._lockedElementCache.push(element);
        } else {
          this._unlockedElementCache.push(element);
        }

        return scrollLocked;
      },

      /**
       * Push an element onto the current scroll lock stack. The most recently
       * pushed element and its children will be considered scrollable. All
       * other elements will not be scrollable.
       *
       * Scroll locking is implemented as a stack so that cases such as
       * dropdowns within dropdowns are handled well.
       *
       * @param {HTMLElement} element The element that should lock scroll.
       */
      pushScrollLock: function(element) {
        // Prevent pushing the same element twice
        if (this._lockingElements.indexOf(element) >= 0) {
          return;
        }

        if (this._lockingElements.length === 0) {
          this._lockScrollInteractions();
        }

        this._lockingElements.push(element);

        this._lockedElementCache = [];
        this._unlockedElementCache = [];
      },

      /**
       * Remove an element from the scroll lock stack. The element being
       * removed does not need to be the most recently pushed element. However,
       * the scroll lock constraints only change when the most recently pushed
       * element is removed.
       *
       * @param {HTMLElement} element The element to remove from the scroll
       * lock stack.
       */
      removeScrollLock: function(element) {
        var index = this._lockingElements.indexOf(element);

        if (index === -1) {
          return;
        }

        this._lockingElements.splice(index, 1);

        this._lockedElementCache = [];
        this._unlockedElementCache = [];

        if (this._lockingElements.length === 0) {
          this._unlockScrollInteractions();
        }
      },

      _lockingElements: [],

      _lockedElementCache: null,

      _unlockedElementCache: null,

      _hasCachedLockedElement: function(element) {
        return this._lockedElementCache.indexOf(element) > -1;
      },

      _hasCachedUnlockedElement: function(element) {
        return this._unlockedElementCache.indexOf(element) > -1;
      },

      _composedTreeContains: function(element, child) {
        // NOTE(cdata): This method iterates over content elements and their
        // corresponding distributed nodes to implement a contains-like method
        // that pierces through the composed tree of the ShadowDOM. Results of
        // this operation are cached (elsewhere) on a per-scroll-lock basis, to
        // guard against potentially expensive lookups happening repeatedly as
        // a user scrolls / touchmoves.
        var contentElements;
        var distributedNodes;
        var contentIndex;
        var nodeIndex;

        if (element.contains(child)) {
          return true;
        }

        contentElements = Polymer.dom(element).querySelectorAll('content');

        for (contentIndex = 0; contentIndex < contentElements.length; ++contentIndex) {

          distributedNodes = Polymer.dom(contentElements[contentIndex]).getDistributedNodes();

          for (nodeIndex = 0; nodeIndex < distributedNodes.length; ++nodeIndex) {

            if (this._composedTreeContains(distributedNodes[nodeIndex], child)) {
              return true;
            }
          }
        }

        return false;
      },

      _scrollInteractionHandler: function(event) {
        // Avoid canceling an event with cancelable=false, e.g. scrolling is in
        // progress and cannot be interrupted.
        if (event.cancelable && this._shouldPreventScrolling(event)) {
          event.preventDefault();
        }
        // If event has targetTouches (touch event), update last touch position.
        if (event.targetTouches) {
          var touch = event.targetTouches[0];
          LAST_TOUCH_POSITION.pageX = touch.pageX;
          LAST_TOUCH_POSITION.pageY = touch.pageY;
        }
      },

      _lockScrollInteractions: function() {
        this._boundScrollHandler = this._boundScrollHandler ||
          this._scrollInteractionHandler.bind(this);
        // Modern `wheel` event for mouse wheel scrolling:
        document.addEventListener('wheel', this._boundScrollHandler, true);
        // Older, non-standard `mousewheel` event for some FF:
        document.addEventListener('mousewheel', this._boundScrollHandler, true);
        // IE:
        document.addEventListener('DOMMouseScroll', this._boundScrollHandler, true);
        // Save the SCROLLABLE_NODES on touchstart, to be used on touchmove.
        document.addEventListener('touchstart', this._boundScrollHandler, true);
        // Mobile devices can scroll on touch move:
        document.addEventListener('touchmove', this._boundScrollHandler, true);
      },

      _unlockScrollInteractions: function() {
        document.removeEventListener('wheel', this._boundScrollHandler, true);
        document.removeEventListener('mousewheel', this._boundScrollHandler, true);
        document.removeEventListener('DOMMouseScroll', this._boundScrollHandler, true);
        document.removeEventListener('touchstart', this._boundScrollHandler, true);
        document.removeEventListener('touchmove', this._boundScrollHandler, true);
      },

      /**
       * Returns true if the event causes scroll outside the current locking
       * element, e.g. pointer/keyboard interactions, or scroll "leaking"
       * outside the locking element when it is already at its scroll boundaries.
       * @param {!Event} event
       * @return {boolean}
       * @private
       */
      _shouldPreventScrolling: function(event) {

        // Update if root target changed. For touch events, ensure we don't
        // update during touchmove.
        var target = Polymer.dom(event).rootTarget;
        if (event.type !== 'touchmove' && ROOT_TARGET !== target) {
          ROOT_TARGET = target;
          SCROLLABLE_NODES = this._getScrollableNodes(Polymer.dom(event).path);
        }

        // Prevent event if no scrollable nodes.
        if (!SCROLLABLE_NODES.length) {
          return true;
        }
        // Don't prevent touchstart event inside the locking element when it has
        // scrollable nodes.
        if (event.type === 'touchstart') {
          return false;
        }
        // Get deltaX/Y.
        var info = this._getScrollInfo(event);
        // Prevent if there is no child that can scroll.
        return !this._getScrollingNode(SCROLLABLE_NODES, info.deltaX, info.deltaY);
      },

      /**
       * Returns an array of scrollable nodes up to the current locking element,
       * which is included too if scrollable.
       * @param {!Array<Node>} nodes
       * @return {Array<Node>} scrollables
       * @private
       */
      _getScrollableNodes: function(nodes) {
        var scrollables = [];
        var lockingIndex = nodes.indexOf(this.currentLockingElement);
        // Loop from root target to locking element (included).
        for (var i = 0; i <= lockingIndex; i++) {
          var node = nodes[i];
          // Skip document fragments.
          if (node.nodeType === 11) {
            continue;
          }
          // Check inline style before checking computed style.
          var style = node.style;
          if (style.overflow !== 'scroll' && style.overflow !== 'auto') {
            style = window.getComputedStyle(node);
          }
          if (style.overflow === 'scroll' || style.overflow === 'auto') {
            scrollables.push(node);
          }
        }
        return scrollables;
      },

      /**
       * Returns the node that is scrolling. If there is no scrolling,
       * returns undefined.
       * @param {!Array<Node>} nodes
       * @param {number} deltaX Scroll delta on the x-axis
       * @param {number} deltaY Scroll delta on the y-axis
       * @return {Node|undefined}
       * @private
       */
      _getScrollingNode: function(nodes, deltaX, deltaY) {
        // No scroll.
        if (!deltaX && !deltaY) {
          return;
        }
        // Check only one axis according to where there is more scroll.
        // Prefer vertical to horizontal.
        var verticalScroll = Math.abs(deltaY) >= Math.abs(deltaX);
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          var canScroll = false;
          if (verticalScroll) {
            // delta < 0 is scroll up, delta > 0 is scroll down.
            canScroll = deltaY < 0 ? node.scrollTop > 0 :
              node.scrollTop < node.scrollHeight - node.clientHeight;
          } else {
            // delta < 0 is scroll left, delta > 0 is scroll right.
            canScroll = deltaX < 0 ? node.scrollLeft > 0 :
              node.scrollLeft < node.scrollWidth - node.clientWidth;
          }
          if (canScroll) {
            return node;
          }
        }
      },

      /**
       * Returns scroll `deltaX` and `deltaY`.
       * @param {!Event} event The scroll event
       * @return {{
       *  deltaX: number The x-axis scroll delta (positive: scroll right,
       *                 negative: scroll left, 0: no scroll),
       *  deltaY: number The y-axis scroll delta (positive: scroll down,
       *                 negative: scroll up, 0: no scroll)
       * }} info
       * @private
       */
      _getScrollInfo: function(event) {
        var info = {
          deltaX: event.deltaX,
          deltaY: event.deltaY
        };
        // Already available.
        if ('deltaX' in event) {
          // do nothing, values are already good.
        }
        // Safari has scroll info in `wheelDeltaX/Y`.
        else if ('wheelDeltaX' in event) {
          info.deltaX = -event.wheelDeltaX;
          info.deltaY = -event.wheelDeltaY;
        }
        // Firefox has scroll info in `detail` and `axis`.
        else if ('axis' in event) {
          info.deltaX = event.axis === 1 ? event.detail : 0;
          info.deltaY = event.axis === 2 ? event.detail : 0;
        }
        // On mobile devices, calculate scroll direction.
        else if (event.targetTouches) {
          var touch = event.targetTouches[0];
          // Touch moves from right to left => scrolling goes right.
          info.deltaX = LAST_TOUCH_POSITION.pageX - touch.pageX;
          // Touch moves from down to up => scrolling goes down.
          info.deltaY = LAST_TOUCH_POSITION.pageY - touch.pageY;
        }
        return info;
      }
    };
  })();
(function() {
      'use strict';

      Polymer({
        is: 'iron-dropdown',

        behaviors: [
          Polymer.IronControlState,
          Polymer.IronA11yKeysBehavior,
          Polymer.IronOverlayBehavior,
          Polymer.NeonAnimationRunnerBehavior
        ],

        properties: {
          /**
           * The orientation against which to align the dropdown content
           * horizontally relative to the dropdown trigger.
           * Overridden from `Polymer.IronFitBehavior`.
           */
          horizontalAlign: {
            type: String,
            value: 'left',
            reflectToAttribute: true
          },

          /**
           * The orientation against which to align the dropdown content
           * vertically relative to the dropdown trigger.
           * Overridden from `Polymer.IronFitBehavior`.
           */
          verticalAlign: {
            type: String,
            value: 'top',
            reflectToAttribute: true
          },

          /**
           * An animation config. If provided, this will be used to animate the
           * opening of the dropdown.
           */
          openAnimationConfig: {
            type: Object
          },

          /**
           * An animation config. If provided, this will be used to animate the
           * closing of the dropdown.
           */
          closeAnimationConfig: {
            type: Object
          },

          /**
           * If provided, this will be the element that will be focused when
           * the dropdown opens.
           */
          focusTarget: {
            type: Object
          },

          /**
           * Set to true to disable animations when opening and closing the
           * dropdown.
           */
          noAnimations: {
            type: Boolean,
            value: false
          },

          /**
           * By default, the dropdown will constrain scrolling on the page
           * to itself when opened.
           * Set to true in order to prevent scroll from being constrained
           * to the dropdown when it opens.
           */
          allowOutsideScroll: {
            type: Boolean,
            value: false
          },

          /**
           * Callback for scroll events.
           * @type {Function}
           * @private
           */
          _boundOnCaptureScroll: {
            type: Function,
            value: function() {
              return this._onCaptureScroll.bind(this);
            }
          }
        },

        listeners: {
          'neon-animation-finish': '_onNeonAnimationFinish'
        },

        observers: [
          '_updateOverlayPosition(positionTarget, verticalAlign, horizontalAlign, verticalOffset, horizontalOffset)'
        ],

        /**
         * The element that is contained by the dropdown, if any.
         */
        get containedElement() {
          return Polymer.dom(this.$.content).getDistributedNodes()[0];
        },

        /**
         * The element that should be focused when the dropdown opens.
         * @deprecated
         */
        get _focusTarget() {
          return this.focusTarget || this.containedElement;
        },

        ready: function() {
          // Memoized scrolling position, used to block scrolling outside.
          this._scrollTop = 0;
          this._scrollLeft = 0;
          // Used to perform a non-blocking refit on scroll.
          this._refitOnScrollRAF = null;
        },

        detached: function() {
          this.cancelAnimation();
          Polymer.IronDropdownScrollManager.removeScrollLock(this);
        },

        /**
         * Called when the value of `opened` changes.
         * Overridden from `IronOverlayBehavior`
         */
        _openedChanged: function() {
          if (this.opened && this.disabled) {
            this.cancel();
          } else {
            this.cancelAnimation();
            this.sizingTarget = this.containedElement || this.sizingTarget;
            this._updateAnimationConfig();
            this._saveScrollPosition();
            if (this.opened) {
              document.addEventListener('scroll', this._boundOnCaptureScroll);
              !this.allowOutsideScroll && Polymer.IronDropdownScrollManager.pushScrollLock(this);
            } else {
              document.removeEventListener('scroll', this._boundOnCaptureScroll);
              Polymer.IronDropdownScrollManager.removeScrollLock(this);
            }
            Polymer.IronOverlayBehaviorImpl._openedChanged.apply(this, arguments);
          }
        },

        /**
         * Overridden from `IronOverlayBehavior`.
         */
        _renderOpened: function() {
          if (!this.noAnimations && this.animationConfig.open) {
            this.$.contentWrapper.classList.add('animating');
            this.playAnimation('open');
          } else {
            Polymer.IronOverlayBehaviorImpl._renderOpened.apply(this, arguments);
          }
        },

        /**
         * Overridden from `IronOverlayBehavior`.
         */
        _renderClosed: function() {

          if (!this.noAnimations && this.animationConfig.close) {
            this.$.contentWrapper.classList.add('animating');
            this.playAnimation('close');
          } else {
            Polymer.IronOverlayBehaviorImpl._renderClosed.apply(this, arguments);
          }
        },

        /**
         * Called when animation finishes on the dropdown (when opening or
         * closing). Responsible for "completing" the process of opening or
         * closing the dropdown by positioning it or setting its display to
         * none.
         */
        _onNeonAnimationFinish: function() {
          this.$.contentWrapper.classList.remove('animating');
          if (this.opened) {
            this._finishRenderOpened();
          } else {
            this._finishRenderClosed();
          }
        },

        _onCaptureScroll: function() {
          if (!this.allowOutsideScroll) {
            this._restoreScrollPosition();
          } else {
            this._refitOnScrollRAF && window.cancelAnimationFrame(this._refitOnScrollRAF);
            this._refitOnScrollRAF = window.requestAnimationFrame(this.refit.bind(this));
          }
        },

        /**
         * Memoizes the scroll position of the outside scrolling element.
         * @private
         */
        _saveScrollPosition: function() {
          if (document.scrollingElement) {
            this._scrollTop = document.scrollingElement.scrollTop;
            this._scrollLeft = document.scrollingElement.scrollLeft;
          } else {
            // Since we don't know if is the body or html, get max.
            this._scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            this._scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
          }
        },

        /**
         * Resets the scroll position of the outside scrolling element.
         * @private
         */
        _restoreScrollPosition: function() {
          if (document.scrollingElement) {
            document.scrollingElement.scrollTop = this._scrollTop;
            document.scrollingElement.scrollLeft = this._scrollLeft;
          } else {
            // Since we don't know if is the body or html, set both.
            document.documentElement.scrollTop = this._scrollTop;
            document.documentElement.scrollLeft = this._scrollLeft;
            document.body.scrollTop = this._scrollTop;
            document.body.scrollLeft = this._scrollLeft;
          }
        },

        /**
         * Constructs the final animation config from different properties used
         * to configure specific parts of the opening and closing animations.
         */
        _updateAnimationConfig: function() {
          var animations = (this.openAnimationConfig || []).concat(this.closeAnimationConfig || []);
          for (var i = 0; i < animations.length; i++) {
            animations[i].node = this.containedElement;
          }
          this.animationConfig = {
            open: this.openAnimationConfig,
            close: this.closeAnimationConfig
          };
        },

        /**
         * Updates the overlay position based on configured horizontal
         * and vertical alignment.
         */
        _updateOverlayPosition: function() {
          if (this.isAttached) {
            // This triggers iron-resize, and iron-overlay-behavior will call refit if needed.
            this.notifyResize();
          }
        },

        /**
         * Apply focus to focusTarget or containedElement
         */
        _applyFocus: function () {
          var focusTarget = this.focusTarget || this.containedElement;
          if (focusTarget && this.opened && !this.noAutoFocus) {
            focusTarget.focus();
          } else {
            Polymer.IronOverlayBehaviorImpl._applyFocus.apply(this, arguments);
          }
        }
      });
    })();
Polymer({
    is: 'paper-menu-grow-height-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;
      var rect = node.getBoundingClientRect();
      var height = rect.height;

      this._effect = new KeyframeEffect(node, [{
        height: (height / 2) + 'px'
      }, {
        height: height + 'px'
      }], this.timingFromConfig(config));

      return this._effect;
    }
  });

  Polymer({
    is: 'paper-menu-grow-width-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;
      var rect = node.getBoundingClientRect();
      var width = rect.width;

      this._effect = new KeyframeEffect(node, [{
        width: (width / 2) + 'px'
      }, {
        width: width + 'px'
      }], this.timingFromConfig(config));

      return this._effect;
    }
  });

  Polymer({
    is: 'paper-menu-shrink-width-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;
      var rect = node.getBoundingClientRect();
      var width = rect.width;

      this._effect = new KeyframeEffect(node, [{
        width: width + 'px'
      }, {
        width: width - (width / 20) + 'px'
      }], this.timingFromConfig(config));

      return this._effect;
    }
  });

  Polymer({
    is: 'paper-menu-shrink-height-animation',

    behaviors: [
      Polymer.NeonAnimationBehavior
    ],

    configure: function(config) {
      var node = config.node;
      var rect = node.getBoundingClientRect();
      var height = rect.height;
      var top = rect.top;

      this.setPrefixedProperty(node, 'transformOrigin', '0 0');

      this._effect = new KeyframeEffect(node, [{
        height: height + 'px',
        transform: 'translateY(0)'
      }, {
        height: height / 2 + 'px',
        transform: 'translateY(-20px)'
      }], this.timingFromConfig(config));

      return this._effect;
    }
  });
(function() {
      'use strict';

      var config = {
        ANIMATION_CUBIC_BEZIER: 'cubic-bezier(.3,.95,.5,1)',
        MAX_ANIMATION_TIME_MS: 400
      };

      var PaperMenuButton = Polymer({
        is: 'paper-menu-button',

        /**
         * Fired when the dropdown opens.
         *
         * @event paper-dropdown-open
         */

        /**
         * Fired when the dropdown closes.
         *
         * @event paper-dropdown-close
         */

        behaviors: [
          Polymer.IronA11yKeysBehavior,
          Polymer.IronControlState
        ],

        properties: {
          /**
           * True if the content is currently displayed.
           */
          opened: {
            type: Boolean,
            value: false,
            notify: true,
            observer: '_openedChanged'
          },

          /**
           * The orientation against which to align the menu dropdown
           * horizontally relative to the dropdown trigger.
           */
          horizontalAlign: {
            type: String,
            value: 'left',
            reflectToAttribute: true
          },

          /**
           * The orientation against which to align the menu dropdown
           * vertically relative to the dropdown trigger.
           */
          verticalAlign: {
            type: String,
            value: 'top',
            reflectToAttribute: true
          },

          /**
           * If true, the `horizontalAlign` and `verticalAlign` properties will
           * be considered preferences instead of strict requirements when
           * positioning the dropdown and may be changed if doing so reduces
           * the area of the dropdown falling outside of `fitInto`.
           */
          dynamicAlign: {
            type: Boolean
          },

          /**
           * A pixel value that will be added to the position calculated for the
           * given `horizontalAlign`. Use a negative value to offset to the
           * left, or a positive value to offset to the right.
           */
          horizontalOffset: {
            type: Number,
            value: 0,
            notify: true
          },

          /**
           * A pixel value that will be added to the position calculated for the
           * given `verticalAlign`. Use a negative value to offset towards the
           * top, or a positive value to offset towards the bottom.
           */
          verticalOffset: {
            type: Number,
            value: 0,
            notify: true
          },

          /**
           * If true, the dropdown will be positioned so that it doesn't overlap
           * the button.
           */
          noOverlap: {
            type: Boolean
          },

          /**
           * Set to true to disable animations when opening and closing the
           * dropdown.
           */
          noAnimations: {
            type: Boolean,
            value: false
          },

          /**
           * Set to true to disable automatically closing the dropdown after
           * a selection has been made.
           */
          ignoreSelect: {
            type: Boolean,
            value: false
          },

          /**
           * Set to true to enable automatically closing the dropdown after an
           * item has been activated, even if the selection did not change.
           */
          closeOnActivate: {
            type: Boolean,
            value: false
          },

          /**
           * An animation config. If provided, this will be used to animate the
           * opening of the dropdown.
           */
          openAnimationConfig: {
            type: Object,
            value: function() {
              return [{
                name: 'fade-in-animation',
                timing: {
                  delay: 100,
                  duration: 200
                }
              }, {
                name: 'paper-menu-grow-width-animation',
                timing: {
                  delay: 100,
                  duration: 150,
                  easing: config.ANIMATION_CUBIC_BEZIER
                }
              }, {
                name: 'paper-menu-grow-height-animation',
                timing: {
                  delay: 100,
                  duration: 275,
                  easing: config.ANIMATION_CUBIC_BEZIER
                }
              }];
            }
          },

          /**
           * An animation config. If provided, this will be used to animate the
           * closing of the dropdown.
           */
          closeAnimationConfig: {
            type: Object,
            value: function() {
              return [{
                name: 'fade-out-animation',
                timing: {
                  duration: 150
                }
              }, {
                name: 'paper-menu-shrink-width-animation',
                timing: {
                  delay: 100,
                  duration: 50,
                  easing: config.ANIMATION_CUBIC_BEZIER
                }
              }, {
                name: 'paper-menu-shrink-height-animation',
                timing: {
                  duration: 200,
                  easing: 'ease-in'
                }
              }];
            }
          },

          /**
           * By default, the dropdown will constrain scrolling on the page
           * to itself when opened.
           * Set to true in order to prevent scroll from being constrained
           * to the dropdown when it opens.
           */
          allowOutsideScroll: {
            type: Boolean,
            value: false
          },

          /**
           * Whether focus should be restored to the button when the menu closes.
           */
          restoreFocusOnClose: {
            type: Boolean,
            value: true
          },

          /**
           * This is the element intended to be bound as the focus target
           * for the `iron-dropdown` contained by `paper-menu-button`.
           */
          _dropdownContent: {
            type: Object
          }
        },

        hostAttributes: {
          role: 'group',
          'aria-haspopup': 'true'
        },

        listeners: {
          'iron-activate': '_onIronActivate',
          'iron-select': '_onIronSelect'
        },

        /**
         * The content element that is contained by the menu button, if any.
         */
        get contentElement() {
          return Polymer.dom(this.$.content).getDistributedNodes()[0];
        },

        /**
         * Toggles the drowpdown content between opened and closed.
         */
        toggle: function() {
          if (this.opened) {
            this.close();
          } else {
            this.open();
          }
        },

        /**
         * Make the dropdown content appear as an overlay positioned relative
         * to the dropdown trigger.
         */
        open: function() {
          if (this.disabled) {
            return;
          }

          this.$.dropdown.open();
        },

        /**
         * Hide the dropdown content.
         */
        close: function() {
          this.$.dropdown.close();
        },

        /**
         * When an `iron-select` event is received, the dropdown should
         * automatically close on the assumption that a value has been chosen.
         *
         * @param {CustomEvent} event A CustomEvent instance with type
         * set to `"iron-select"`.
         */
        _onIronSelect: function(event) {
          if (!this.ignoreSelect) {
            this.close();
          }
        },

        /**
         * Closes the dropdown when an `iron-activate` event is received if
         * `closeOnActivate` is true.
         *
         * @param {CustomEvent} event A CustomEvent of type 'iron-activate'.
         */
        _onIronActivate: function(event) {
          if (this.closeOnActivate) {
            this.close();
          }
        },

        /**
         * When the dropdown opens, the `paper-menu-button` fires `paper-open`.
         * When the dropdown closes, the `paper-menu-button` fires `paper-close`.
         *
         * @param {boolean} opened True if the dropdown is opened, otherwise false.
         * @param {boolean} oldOpened The previous value of `opened`.
         */
        _openedChanged: function(opened, oldOpened) {
          if (opened) {
            // TODO(cdata): Update this when we can measure changes in distributed
            // children in an idiomatic way.
            // We poke this property in case the element has changed. This will
            // cause the focus target for the `iron-dropdown` to be updated as
            // necessary:
            this._dropdownContent = this.contentElement;
            this.fire('paper-dropdown-open');
          } else if (oldOpened != null) {
            this.fire('paper-dropdown-close');
          }
        },

        /**
         * If the dropdown is open when disabled becomes true, close the
         * dropdown.
         *
         * @param {boolean} disabled True if disabled, otherwise false.
         */
        _disabledChanged: function(disabled) {
          Polymer.IronControlState._disabledChanged.apply(this, arguments);
          if (disabled && this.opened) {
            this.close();
          }
        },

        __onIronOverlayCanceled: function(event) {
          var uiEvent = event.detail;
          var target = Polymer.dom(uiEvent).rootTarget;
          var trigger = this.$.trigger;
          var path = Polymer.dom(uiEvent).path;

          if (path.indexOf(trigger) > -1) {
            event.preventDefault();
          }
        }
      });

      Object.keys(config).forEach(function (key) {
        PaperMenuButton[key] = config[key];
      });

      Polymer.PaperMenuButton = PaperMenuButton;
    })();
(function() {
      'use strict';

      Polymer({
        is: 'paper-dropdown-menu',

        behaviors: [
          Polymer.IronButtonState,
          Polymer.IronControlState,
          Polymer.IronFormElementBehavior,
          Polymer.IronValidatableBehavior
        ],

        properties: {
          /**
           * The derived "label" of the currently selected item. This value
           * is the `label` property on the selected item if set, or else the
           * trimmed text content of the selected item.
           */
          selectedItemLabel: {
            type: String,
            notify: true,
            readOnly: true
          },

          /**
           * The last selected item. An item is selected if the dropdown menu has
           * a child with class `dropdown-content`, and that child triggers an
           * `iron-select` event with the selected `item` in the `detail`.
           *
           * @type {?Object}
           */
          selectedItem: {
            type: Object,
            notify: true,
            readOnly: true
          },

          /**
           * The value for this element that will be used when submitting in
           * a form. It is read only, and will always have the same value
           * as `selectedItemLabel`.
           */
          value: {
            type: String,
            notify: true,
            readOnly: true
          },

          /**
           * The label for the dropdown.
           */
          label: {
            type: String
          },

          /**
           * The placeholder for the dropdown.
           */
          placeholder: {
            type: String
          },

          /**
           * The error message to display when invalid.
           */
          errorMessage: {
              type: String
          },

          /**
           * True if the dropdown is open. Otherwise, false.
           */
          opened: {
            type: Boolean,
            notify: true,
            value: false,
            observer: '_openedChanged'
          },

          /**
           * By default, the dropdown will constrain scrolling on the page
           * to itself when opened.
           * Set to true in order to prevent scroll from being constrained
           * to the dropdown when it opens.
           */
          allowOutsideScroll: {
            type: Boolean,
            value: false
          },

          /**
           * Set to true to disable the floating label. Bind this to the
           * `<paper-input-container>`'s `noLabelFloat` property.
           */
          noLabelFloat: {
              type: Boolean,
              value: false,
              reflectToAttribute: true
          },

          /**
           * Set to true to always float the label. Bind this to the
           * `<paper-input-container>`'s `alwaysFloatLabel` property.
           */
          alwaysFloatLabel: {
            type: Boolean,
            value: false
          },

          /**
           * Set to true to disable animations when opening and closing the
           * dropdown.
           */
          noAnimations: {
            type: Boolean,
            value: false
          },

          /**
           * The orientation against which to align the menu dropdown
           * horizontally relative to the dropdown trigger.
           */
          horizontalAlign: {
            type: String,
            value: 'right'
          },

          /**
           * The orientation against which to align the menu dropdown
           * vertically relative to the dropdown trigger.
           */
          verticalAlign: {
            type: String,
            value: 'top'
          }
        },

        listeners: {
          'tap': '_onTap'
        },

        keyBindings: {
          'up down': 'open',
          'esc': 'close'
        },

        hostAttributes: {
          role: 'combobox',
          'aria-autocomplete': 'none',
          'aria-haspopup': 'true'
        },

        observers: [
          '_selectedItemChanged(selectedItem)'
        ],

        attached: function() {
          // NOTE(cdata): Due to timing, a preselected value in a `IronSelectable`
          // child will cause an `iron-select` event to fire while the element is
          // still in a `DocumentFragment`. This has the effect of causing
          // handlers not to fire. So, we double check this value on attached:
          var contentElement = this.contentElement;
          if (contentElement && contentElement.selectedItem) {
            this._setSelectedItem(contentElement.selectedItem);
          }
        },

        /**
         * The content element that is contained by the dropdown menu, if any.
         */
        get contentElement() {
          return Polymer.dom(this.$.content).getDistributedNodes()[0];
        },

        /**
         * Show the dropdown content.
         */
        open: function() {
          this.$.menuButton.open();
        },

        /**
         * Hide the dropdown content.
         */
        close: function() {
          this.$.menuButton.close();
        },

        /**
         * A handler that is called when `iron-select` is fired.
         *
         * @param {CustomEvent} event An `iron-select` event.
         */
        _onIronSelect: function(event) {
          this._setSelectedItem(event.detail.item);
        },

        /**
         * A handler that is called when `iron-deselect` is fired.
         *
         * @param {CustomEvent} event An `iron-deselect` event.
         */
        _onIronDeselect: function(event) {
          this._setSelectedItem(null);
        },

        /**
         * A handler that is called when the dropdown is tapped.
         *
         * @param {CustomEvent} event A tap event.
         */
        _onTap: function(event) {
          if (Polymer.Gestures.findOriginalTarget(event) === this) {
            this.open();
          }
        },

        /**
         * Compute the label for the dropdown given a selected item.
         *
         * @param {Element} selectedItem A selected Element item, with an
         * optional `label` property.
         */
        _selectedItemChanged: function(selectedItem) {
          var value = '';
          if (!selectedItem) {
            value = '';
          } else {
            value = selectedItem.label || selectedItem.getAttribute('label') || selectedItem.textContent.trim();
          }

          this._setValue(value);
          this._setSelectedItemLabel(value);
        },

        /**
         * Compute the vertical offset of the menu based on the value of
         * `noLabelFloat`.
         *
         * @param {boolean} noLabelFloat True if the label should not float
         * above the input, otherwise false.
         */
        _computeMenuVerticalOffset: function(noLabelFloat) {
          // NOTE(cdata): These numbers are somewhat magical because they are
          // derived from the metrics of elements internal to `paper-input`'s
          // template. The metrics will change depending on whether or not the
          // input has a floating label.
          return noLabelFloat ? -4 : 8;
        },

        /**
         * Returns false if the element is required and does not have a selection,
         * and true otherwise.
         * @param {*=} _value Ignored.
         * @return {boolean} true if `required` is false, or if `required` is true
         * and the element has a valid selection.
         */
        _getValidity: function(_value) {
          return this.disabled || !this.required || (this.required && !!this.value);
        },

        _openedChanged: function() {
          var openState = this.opened ? 'true' : 'false';
          var e = this.contentElement;
          if (e) {
            e.setAttribute('aria-expanded', openState);
          }
        }
      });
    })();
/** @polymerBehavior Polymer.PaperItemBehavior */
  Polymer.PaperItemBehaviorImpl = {
    hostAttributes: {
      role: 'option',
      tabindex: '0'
    }
  };

  /** @polymerBehavior */
  Polymer.PaperItemBehavior = [
    Polymer.IronButtonState,
    Polymer.IronControlState,
    Polymer.PaperItemBehaviorImpl
  ];
Polymer({
      is: 'paper-item',

      behaviors: [
        Polymer.PaperItemBehavior
      ]
    });
Polymer({
      is: 'paper-item-body'
    });
Polymer({
      is: 'paper-icon-item',

      behaviors: [
        Polymer.PaperItemBehavior
      ]
    });
Polymer({
    is: 'paper-material',

    properties: {
      /**
       * The z-depth of this element, from 0-5. Setting to 0 will remove the
       * shadow, and each increasing number greater than 0 will be "deeper"
       * than the last.
       *
       * @attribute elevation
       * @type number
       * @default 1
       */
      elevation: {
        type: Number,
        reflectToAttribute: true,
        value: 1
      },

      /**
       * Set this to true to animate the shadow when setting a new
       * `elevation` value.
       *
       * @attribute animated
       * @type boolean
       * @default false
       */
      animated: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      }
    }
  });
/**
   * @param {!Function} selectCallback
   * @constructor
   */
  Polymer.IronSelection = function(selectCallback) {
    this.selection = [];
    this.selectCallback = selectCallback;
  };

  Polymer.IronSelection.prototype = {

    /**
     * Retrieves the selected item(s).
     *
     * @method get
     * @returns Returns the selected item(s). If the multi property is true,
     * `get` will return an array, otherwise it will return
     * the selected item or undefined if there is no selection.
     */
    get: function() {
      return this.multi ? this.selection.slice() : this.selection[0];
    },

    /**
     * Clears all the selection except the ones indicated.
     *
     * @method clear
     * @param {Array} excludes items to be excluded.
     */
    clear: function(excludes) {
      this.selection.slice().forEach(function(item) {
        if (!excludes || excludes.indexOf(item) < 0) {
          this.setItemSelected(item, false);
        }
      }, this);
    },

    /**
     * Indicates if a given item is selected.
     *
     * @method isSelected
     * @param {*} item The item whose selection state should be checked.
     * @returns Returns true if `item` is selected.
     */
    isSelected: function(item) {
      return this.selection.indexOf(item) >= 0;
    },

    /**
     * Sets the selection state for a given item to either selected or deselected.
     *
     * @method setItemSelected
     * @param {*} item The item to select.
     * @param {boolean} isSelected True for selected, false for deselected.
     */
    setItemSelected: function(item, isSelected) {
      if (item != null) {
        if (isSelected !== this.isSelected(item)) {
          // proceed to update selection only if requested state differs from current
          if (isSelected) {
            this.selection.push(item);
          } else {
            var i = this.selection.indexOf(item);
            if (i >= 0) {
              this.selection.splice(i, 1);
            }
          }
          if (this.selectCallback) {
            this.selectCallback(item, isSelected);
          }
        }
      }
    },

    /**
     * Sets the selection state for a given item. If the `multi` property
     * is true, then the selected state of `item` will be toggled; otherwise
     * the `item` will be selected.
     *
     * @method select
     * @param {*} item The item to select.
     */
    select: function(item) {
      if (this.multi) {
        this.toggle(item);
      } else if (this.get() !== item) {
        this.setItemSelected(this.get(), false);
        this.setItemSelected(item, true);
      }
    },

    /**
     * Toggles the selection state for `item`.
     *
     * @method toggle
     * @param {*} item The item to toggle.
     */
    toggle: function(item) {
      this.setItemSelected(item, !this.isSelected(item));
    }

  };
/** @polymerBehavior */
  Polymer.IronSelectableBehavior = {

      /**
       * Fired when iron-selector is activated (selected or deselected).
       * It is fired before the selected items are changed.
       * Cancel the event to abort selection.
       *
       * @event iron-activate
       */

      /**
       * Fired when an item is selected
       *
       * @event iron-select
       */

      /**
       * Fired when an item is deselected
       *
       * @event iron-deselect
       */

      /**
       * Fired when the list of selectable items changes (e.g., items are
       * added or removed). The detail of the event is a mutation record that
       * describes what changed.
       *
       * @event iron-items-changed
       */

    properties: {

      /**
       * If you want to use an attribute value or property of an element for
       * `selected` instead of the index, set this to the name of the attribute
       * or property. Hyphenated values are converted to camel case when used to
       * look up the property of a selectable element. Camel cased values are
       * *not* converted to hyphenated values for attribute lookup. It's
       * recommended that you provide the hyphenated form of the name so that
       * selection works in both cases. (Use `attr-or-property-name` instead of
       * `attrOrPropertyName`.)
       */
      attrForSelected: {
        type: String,
        value: null
      },

      /**
       * Gets or sets the selected element. The default is to use the index of the item.
       * @type {string|number}
       */
      selected: {
        type: String,
        notify: true
      },

      /**
       * Returns the currently selected item.
       *
       * @type {?Object}
       */
      selectedItem: {
        type: Object,
        readOnly: true,
        notify: true
      },

      /**
       * The event that fires from items when they are selected. Selectable
       * will listen for this event from items and update the selection state.
       * Set to empty string to listen to no events.
       */
      activateEvent: {
        type: String,
        value: 'tap',
        observer: '_activateEventChanged'
      },

      /**
       * This is a CSS selector string.  If this is set, only items that match the CSS selector
       * are selectable.
       */
      selectable: String,

      /**
       * The class to set on elements when selected.
       */
      selectedClass: {
        type: String,
        value: 'iron-selected'
      },

      /**
       * The attribute to set on elements when selected.
       */
      selectedAttribute: {
        type: String,
        value: null
      },

      /**
       * Default fallback if the selection based on selected with `attrForSelected`
       * is not found.
       */
      fallbackSelection: {
        type: String,
        value: null
      },

      /**
       * The list of items from which a selection can be made.
       */
      items: {
        type: Array,
        readOnly: true,
        notify: true,
        value: function() {
          return [];
        }
      },

      /**
       * The set of excluded elements where the key is the `localName`
       * of the element that will be ignored from the item list.
       *
       * @default {template: 1}
       */
      _excludedLocalNames: {
        type: Object,
        value: function() {
          return {
            'template': 1
          };
        }
      }
    },

    observers: [
      '_updateAttrForSelected(attrForSelected)',
      '_updateSelected(selected)',
      '_checkFallback(fallbackSelection)'
    ],

    created: function() {
      this._bindFilterItem = this._filterItem.bind(this);
      this._selection = new Polymer.IronSelection(this._applySelection.bind(this));
    },

    attached: function() {
      this._observer = this._observeItems(this);
      this._updateItems();
      if (!this._shouldUpdateSelection) {
        this._updateSelected();
      }
      this._addListener(this.activateEvent);
    },

    detached: function() {
      if (this._observer) {
        Polymer.dom(this).unobserveNodes(this._observer);
      }
      this._removeListener(this.activateEvent);
    },

    /**
     * Returns the index of the given item.
     *
     * @method indexOf
     * @param {Object} item
     * @returns Returns the index of the item
     */
    indexOf: function(item) {
      return this.items.indexOf(item);
    },

    /**
     * Selects the given value.
     *
     * @method select
     * @param {string|number} value the value to select.
     */
    select: function(value) {
      this.selected = value;
    },

    /**
     * Selects the previous item.
     *
     * @method selectPrevious
     */
    selectPrevious: function() {
      var length = this.items.length;
      var index = (Number(this._valueToIndex(this.selected)) - 1 + length) % length;
      this.selected = this._indexToValue(index);
    },

    /**
     * Selects the next item.
     *
     * @method selectNext
     */
    selectNext: function() {
      var index = (Number(this._valueToIndex(this.selected)) + 1) % this.items.length;
      this.selected = this._indexToValue(index);
    },

    /**
     * Selects the item at the given index.
     *
     * @method selectIndex
     */
    selectIndex: function(index) {
      this.select(this._indexToValue(index));
    },

    /**
     * Force a synchronous update of the `items` property.
     *
     * NOTE: Consider listening for the `iron-items-changed` event to respond to
     * updates to the set of selectable items after updates to the DOM list and
     * selection state have been made.
     *
     * WARNING: If you are using this method, you should probably consider an
     * alternate approach. Synchronously querying for items is potentially
     * slow for many use cases. The `items` property will update asynchronously
     * on its own to reflect selectable items in the DOM.
     */
    forceSynchronousItemUpdate: function() {
      this._updateItems();
    },

    get _shouldUpdateSelection() {
      return this.selected != null;
    },

    _checkFallback: function() {
      if (this._shouldUpdateSelection) {
        this._updateSelected();
      }
    },

    _addListener: function(eventName) {
      this.listen(this, eventName, '_activateHandler');
    },

    _removeListener: function(eventName) {
      this.unlisten(this, eventName, '_activateHandler');
    },

    _activateEventChanged: function(eventName, old) {
      this._removeListener(old);
      this._addListener(eventName);
    },

    _updateItems: function() {
      var nodes = Polymer.dom(this).queryDistributedElements(this.selectable || '*');
      nodes = Array.prototype.filter.call(nodes, this._bindFilterItem);
      this._setItems(nodes);
    },

    _updateAttrForSelected: function() {
      if (this._shouldUpdateSelection) {
        this.selected = this._indexToValue(this.indexOf(this.selectedItem));
      }
    },

    _updateSelected: function() {
      this._selectSelected(this.selected);
    },

    _selectSelected: function(selected) {
      this._selection.select(this._valueToItem(this.selected));
      // Check for items, since this array is populated only when attached
      // Since Number(0) is falsy, explicitly check for undefined
      if (this.fallbackSelection && this.items.length && (this._selection.get() === undefined)) {
        this.selected = this.fallbackSelection;
      }
    },

    _filterItem: function(node) {
      return !this._excludedLocalNames[node.localName];
    },

    _valueToItem: function(value) {
      return (value == null) ? null : this.items[this._valueToIndex(value)];
    },

    _valueToIndex: function(value) {
      if (this.attrForSelected) {
        for (var i = 0, item; item = this.items[i]; i++) {
          if (this._valueForItem(item) == value) {
            return i;
          }
        }
      } else {
        return Number(value);
      }
    },

    _indexToValue: function(index) {
      if (this.attrForSelected) {
        var item = this.items[index];
        if (item) {
          return this._valueForItem(item);
        }
      } else {
        return index;
      }
    },

    _valueForItem: function(item) {
      var propValue = item[Polymer.CaseMap.dashToCamelCase(this.attrForSelected)];
      return propValue != undefined ? propValue : item.getAttribute(this.attrForSelected);
    },

    _applySelection: function(item, isSelected) {
      if (this.selectedClass) {
        this.toggleClass(this.selectedClass, isSelected, item);
      }
      if (this.selectedAttribute) {
        this.toggleAttribute(this.selectedAttribute, isSelected, item);
      }
      this._selectionChange();
      this.fire('iron-' + (isSelected ? 'select' : 'deselect'), {item: item});
    },

    _selectionChange: function() {
      this._setSelectedItem(this._selection.get());
    },

    // observe items change under the given node.
    _observeItems: function(node) {
      return Polymer.dom(node).observeNodes(function(mutation) {
        this._updateItems();

        if (this._shouldUpdateSelection) {
          this._updateSelected();
        }

        // Let other interested parties know about the change so that
        // we don't have to recreate mutation observers everywhere.
        this.fire('iron-items-changed', mutation, {
          bubbles: false,
          cancelable: false
        });
      });
    },

    _activateHandler: function(e) {
      var t = e.target;
      var items = this.items;
      while (t && t != this) {
        var i = items.indexOf(t);
        if (i >= 0) {
          var value = this._indexToValue(i);
          this._itemActivate(value, t);
          return;
        }
        t = t.parentNode;
      }
    },

    _itemActivate: function(value, item) {
      if (!this.fire('iron-activate',
          {selected: value, item: item}, {cancelable: true}).defaultPrevented) {
        this.select(value);
      }
    }

  };
/** @polymerBehavior Polymer.IronMultiSelectableBehavior */
  Polymer.IronMultiSelectableBehaviorImpl = {
    properties: {

      /**
       * If true, multiple selections are allowed.
       */
      multi: {
        type: Boolean,
        value: false,
        observer: 'multiChanged'
      },

      /**
       * Gets or sets the selected elements. This is used instead of `selected` when `multi`
       * is true.
       */
      selectedValues: {
        type: Array,
        notify: true
      },

      /**
       * Returns an array of currently selected items.
       */
      selectedItems: {
        type: Array,
        readOnly: true,
        notify: true
      },

    },

    observers: [
      '_updateSelected(selectedValues.splices)'
    ],

    /**
     * Selects the given value. If the `multi` property is true, then the selected state of the
     * `value` will be toggled; otherwise the `value` will be selected.
     *
     * @method select
     * @param {string|number} value the value to select.
     */
    select: function(value) {
      if (this.multi) {
        if (this.selectedValues) {
          this._toggleSelected(value);
        } else {
          this.selectedValues = [value];
        }
      } else {
        this.selected = value;
      }
    },

    multiChanged: function(multi) {
      this._selection.multi = multi;
    },

    get _shouldUpdateSelection() {
      return this.selected != null ||
        (this.selectedValues != null && this.selectedValues.length);
    },

    _updateAttrForSelected: function() {
      if (!this.multi) {
        Polymer.IronSelectableBehavior._updateAttrForSelected.apply(this);
      } else if (this._shouldUpdateSelection) {
        this.selectedValues = this.selectedItems.map(function(selectedItem) {
          return this._indexToValue(this.indexOf(selectedItem));
        }, this).filter(function(unfilteredValue) {
          return unfilteredValue != null;
        }, this);
      }
    },

    _updateSelected: function() {
      if (this.multi) {
        this._selectMulti(this.selectedValues);
      } else {
        this._selectSelected(this.selected);
      }
    },

    _selectMulti: function(values) {
      if (values) {
        var selectedItems = this._valuesToItems(values);
        // clear all but the current selected items
        this._selection.clear(selectedItems);
        // select only those not selected yet
        for (var i = 0; i < selectedItems.length; i++) {
          this._selection.setItemSelected(selectedItems[i], true);
        }
        // Check for items, since this array is populated only when attached
        if (this.fallbackSelection && this.items.length && !this._selection.get().length) {
          var fallback = this._valueToItem(this.fallbackSelection);
          if (fallback) {
            this.selectedValues = [this.fallbackSelection];
          }
        }
      } else {
        this._selection.clear();
      }
    },

    _selectionChange: function() {
      var s = this._selection.get();
      if (this.multi) {
        this._setSelectedItems(s);
      } else {
        this._setSelectedItems([s]);
        this._setSelectedItem(s);
      }
    },

    _toggleSelected: function(value) {
      var i = this.selectedValues.indexOf(value);
      var unselected = i < 0;
      if (unselected) {
        this.push('selectedValues',value);
      } else {
        this.splice('selectedValues',i,1);
      }
    },

    _valuesToItems: function(values) {
      return (values == null) ? null : values.map(function(value) {
        return this._valueToItem(value);
      }, this);
    }
  };

  /** @polymerBehavior */
  Polymer.IronMultiSelectableBehavior = [
    Polymer.IronSelectableBehavior,
    Polymer.IronMultiSelectableBehaviorImpl
  ];
/**
   * `Polymer.IronMenuBehavior` implements accessible menu behavior.
   *
   * @demo demo/index.html
   * @polymerBehavior Polymer.IronMenuBehavior
   */
  Polymer.IronMenuBehaviorImpl = {

    properties: {

      /**
       * Returns the currently focused item.
       * @type {?Object}
       */
      focusedItem: {
        observer: '_focusedItemChanged',
        readOnly: true,
        type: Object
      },

      /**
       * The attribute to use on menu items to look up the item title. Typing the first
       * letter of an item when the menu is open focuses that item. If unset, `textContent`
       * will be used.
       */
      attrForItemTitle: {
        type: String
      }
    },

    hostAttributes: {
      'role': 'menu',
      'tabindex': '0'
    },

    observers: [
      '_updateMultiselectable(multi)'
    ],

    listeners: {
      'focus': '_onFocus',
      'keydown': '_onKeydown',
      'iron-items-changed': '_onIronItemsChanged'
    },

    keyBindings: {
      'up': '_onUpKey',
      'down': '_onDownKey',
      'esc': '_onEscKey',
      'shift+tab:keydown': '_onShiftTabDown'
    },

    attached: function() {
      this._resetTabindices();
    },

    /**
     * Selects the given value. If the `multi` property is true, then the selected state of the
     * `value` will be toggled; otherwise the `value` will be selected.
     *
     * @param {string|number} value the value to select.
     */
    select: function(value) {
      // Cancel automatically focusing a default item if the menu received focus
      // through a user action selecting a particular item.
      if (this._defaultFocusAsync) {
        this.cancelAsync(this._defaultFocusAsync);
        this._defaultFocusAsync = null;
      }
      var item = this._valueToItem(value);
      if (item && item.hasAttribute('disabled')) return;
      this._setFocusedItem(item);
      Polymer.IronMultiSelectableBehaviorImpl.select.apply(this, arguments);
    },

    /**
     * Resets all tabindex attributes to the appropriate value based on the
     * current selection state. The appropriate value is `0` (focusable) for
     * the default selected item, and `-1` (not keyboard focusable) for all
     * other items.
     */
    _resetTabindices: function() {
      var selectedItem = this.multi ? (this.selectedItems && this.selectedItems[0]) : this.selectedItem;

      this.items.forEach(function(item) {
        item.setAttribute('tabindex', item === selectedItem ? '0' : '-1');
      }, this);
    },

    /**
     * Sets appropriate ARIA based on whether or not the menu is meant to be
     * multi-selectable.
     *
     * @param {boolean} multi True if the menu should be multi-selectable.
     */
    _updateMultiselectable: function(multi) {
      if (multi) {
        this.setAttribute('aria-multiselectable', 'true');
      } else {
        this.removeAttribute('aria-multiselectable');
      }
    },

    /**
     * Given a KeyboardEvent, this method will focus the appropriate item in the
     * menu (if there is a relevant item, and it is possible to focus it).
     *
     * @param {KeyboardEvent} event A KeyboardEvent.
     */
    _focusWithKeyboardEvent: function(event) {
      for (var i = 0, item; item = this.items[i]; i++) {
        var attr = this.attrForItemTitle || 'textContent';
        var title = item[attr] || item.getAttribute(attr);

        if (!item.hasAttribute('disabled') && title &&
            title.trim().charAt(0).toLowerCase() === String.fromCharCode(event.keyCode).toLowerCase()) {
          this._setFocusedItem(item);
          break;
        }
      }
    },

    /**
     * Focuses the previous item (relative to the currently focused item) in the
     * menu, disabled items will be skipped.
     * Loop until length + 1 to handle case of single item in menu.
     */
    _focusPrevious: function() {
      var length = this.items.length;
      var curFocusIndex = Number(this.indexOf(this.focusedItem));

      for (var i = 1; i < length + 1; i++) {
        var item = this.items[(curFocusIndex - i + length) % length];
        if (!item.hasAttribute('disabled')) {
          var owner = Polymer.dom(item).getOwnerRoot() || document;
          this._setFocusedItem(item);

          // Focus might not have worked, if the element was hidden or not
          // focusable. In that case, try again.
          if (Polymer.dom(owner).activeElement == item) {
            return;
          }
        }
      }
    },

    /**
     * Focuses the next item (relative to the currently focused item) in the
     * menu, disabled items will be skipped.
     * Loop until length + 1 to handle case of single item in menu.
     */
    _focusNext: function() {
      var length = this.items.length;
      var curFocusIndex = Number(this.indexOf(this.focusedItem));

      for (var i = 1; i < length + 1; i++) {
        var item = this.items[(curFocusIndex + i) % length];
        if (!item.hasAttribute('disabled')) {
          var owner = Polymer.dom(item).getOwnerRoot() || document;
          this._setFocusedItem(item);

          // Focus might not have worked, if the element was hidden or not
          // focusable. In that case, try again.
          if (Polymer.dom(owner).activeElement == item) {
            return;
          }
        }
      }
    },

    /**
     * Mutates items in the menu based on provided selection details, so that
     * all items correctly reflect selection state.
     *
     * @param {Element} item An item in the menu.
     * @param {boolean} isSelected True if the item should be shown in a
     * selected state, otherwise false.
     */
    _applySelection: function(item, isSelected) {
      if (isSelected) {
        item.setAttribute('aria-selected', 'true');
      } else {
        item.removeAttribute('aria-selected');
      }
      Polymer.IronSelectableBehavior._applySelection.apply(this, arguments);
    },

    /**
     * Discretely updates tabindex values among menu items as the focused item
     * changes.
     *
     * @param {Element} focusedItem The element that is currently focused.
     * @param {?Element} old The last element that was considered focused, if
     * applicable.
     */
    _focusedItemChanged: function(focusedItem, old) {
      old && old.setAttribute('tabindex', '-1');
      if (focusedItem) {
        focusedItem.setAttribute('tabindex', '0');
        focusedItem.focus();
      }
    },

    /**
     * A handler that responds to mutation changes related to the list of items
     * in the menu.
     *
     * @param {CustomEvent} event An event containing mutation records as its
     * detail.
     */
    _onIronItemsChanged: function(event) {
      if (event.detail.addedNodes.length) {
        this._resetTabindices();
      }
    },

    /**
     * Handler that is called when a shift+tab keypress is detected by the menu.
     *
     * @param {CustomEvent} event A key combination event.
     */
    _onShiftTabDown: function(event) {
      var oldTabIndex = this.getAttribute('tabindex');

      Polymer.IronMenuBehaviorImpl._shiftTabPressed = true;

      this._setFocusedItem(null);

      this.setAttribute('tabindex', '-1');

      this.async(function() {
        this.setAttribute('tabindex', oldTabIndex);
        Polymer.IronMenuBehaviorImpl._shiftTabPressed = false;
        // NOTE(cdata): polymer/polymer#1305
      }, 1);
    },

    /**
     * Handler that is called when the menu receives focus.
     *
     * @param {FocusEvent} event A focus event.
     */
    _onFocus: function(event) {
      if (Polymer.IronMenuBehaviorImpl._shiftTabPressed) {
        // do not focus the menu itself
        return;
      }

      // Do not focus the selected tab if the deepest target is part of the
      // menu element's local DOM and is focusable.
      var rootTarget = /** @type {?HTMLElement} */(
          Polymer.dom(event).rootTarget);
      if (rootTarget !== this && typeof rootTarget.tabIndex !== "undefined" && !this.isLightDescendant(rootTarget)) {
        return;
      }

      // clear the cached focus item
      this._defaultFocusAsync = this.async(function() {
        // focus the selected item when the menu receives focus, or the first item
        // if no item is selected
        var selectedItem = this.multi ? (this.selectedItems && this.selectedItems[0]) : this.selectedItem;

        this._setFocusedItem(null);

        if (selectedItem) {
          this._setFocusedItem(selectedItem);
        } else if (this.items[0]) {
          // We find the first none-disabled item (if one exists)
          this._focusNext();
        }
      });
    },

    /**
     * Handler that is called when the up key is pressed.
     *
     * @param {CustomEvent} event A key combination event.
     */
    _onUpKey: function(event) {
      // up and down arrows moves the focus
      this._focusPrevious();
      event.detail.keyboardEvent.preventDefault();
    },

    /**
     * Handler that is called when the down key is pressed.
     *
     * @param {CustomEvent} event A key combination event.
     */
    _onDownKey: function(event) {
      this._focusNext();
      event.detail.keyboardEvent.preventDefault();
    },

    /**
     * Handler that is called when the esc key is pressed.
     *
     * @param {CustomEvent} event A key combination event.
     */
    _onEscKey: function(event) {
      // esc blurs the control
      this.focusedItem.blur();
    },

    /**
     * Handler that is called when a keydown event is detected.
     *
     * @param {KeyboardEvent} event A keyboard event.
     */
    _onKeydown: function(event) {
      if (!this.keyboardEventMatchesKeys(event, 'up down esc')) {
        // all other keys focus the menu item starting with that character
        this._focusWithKeyboardEvent(event);
      }
      event.stopPropagation();
    },

    // override _activateHandler
    _activateHandler: function(event) {
      Polymer.IronSelectableBehavior._activateHandler.call(this, event);
      event.stopPropagation();
    }
  };

  Polymer.IronMenuBehaviorImpl._shiftTabPressed = false;

  /** @polymerBehavior Polymer.IronMenuBehavior */
  Polymer.IronMenuBehavior = [
    Polymer.IronMultiSelectableBehavior,
    Polymer.IronA11yKeysBehavior,
    Polymer.IronMenuBehaviorImpl
  ];
(function() {
      Polymer({
        is: 'paper-menu',

        behaviors: [
          Polymer.IronMenuBehavior
        ]
      });
    })();
Polymer({
      is: 'paper-radio-button',

      behaviors: [
        Polymer.PaperCheckedElementBehavior
      ],

      hostAttributes: {
        role: 'radio',
        'aria-checked': false,
        tabindex: 0
      },

      properties: {
        /**
         * Fired when the checked state changes due to user interaction.
         *
         * @event change
         */

        /**
         * Fired when the checked state changes.
         *
         * @event iron-change
         */

        ariaActiveAttribute: {
          type: String,
          value: 'aria-checked'
        }
      },

      ready: function() {
        this._rippleContainer = this.$.radioContainer;
      }
    });
/**
   * `Polymer.IronMenubarBehavior` implements accessible menubar behavior.
   *
   * @polymerBehavior Polymer.IronMenubarBehavior
   */
  Polymer.IronMenubarBehaviorImpl = {

    hostAttributes: {
      'role': 'menubar'
    },

    keyBindings: {
      'left': '_onLeftKey',
      'right': '_onRightKey'
    },

    _onUpKey: function(event) {
      this.focusedItem.click();
      event.detail.keyboardEvent.preventDefault();
    },

    _onDownKey: function(event) {
      this.focusedItem.click();
      event.detail.keyboardEvent.preventDefault();
    },

    get _isRTL() {
      return window.getComputedStyle(this)['direction'] === 'rtl';
    },

    _onLeftKey: function(event) {
      if (this._isRTL) {
        this._focusNext();
      } else {
        this._focusPrevious();
      }
      event.detail.keyboardEvent.preventDefault();
    },

    _onRightKey: function(event) {
      if (this._isRTL) {
        this._focusPrevious();
      } else {
        this._focusNext();
      }
      event.detail.keyboardEvent.preventDefault();
    },

    _onKeydown: function(event) {
      if (this.keyboardEventMatchesKeys(event, 'up down left right esc')) {
        return;
      }

      // all other keys focus the menu item starting with that character
      this._focusWithKeyboardEvent(event);
    }

  };

  /** @polymerBehavior Polymer.IronMenubarBehavior */
  Polymer.IronMenubarBehavior = [
    Polymer.IronMenuBehavior,
    Polymer.IronMenubarBehaviorImpl
  ];
Polymer({
    is: 'paper-radio-group',

    behaviors: [
      Polymer.IronMenubarBehavior
    ],

    hostAttributes: {
      role: 'radiogroup',
      tabindex: 0
    },

    properties: {
      /**
       * Fired when the radio group selection changes.
       *
       * @event paper-radio-group-changed
       */

      /**
       * Overriden from Polymer.IronSelectableBehavior
       */
      attrForSelected: {
        type: String,
        value: 'name'
      },

      /**
       * Overriden from Polymer.IronSelectableBehavior
       */
      selectedAttribute: {
        type: String,
        value: 'checked'
      },

      /**
       * Overriden from Polymer.IronSelectableBehavior
       */
      selectable: {
        type: String,
        value: 'paper-radio-button'
      },

      /**
       * If true, radio-buttons can be deselected
       */
      allowEmptySelection: {
        type: Boolean,
        value: false
      }
    },

    /**
     * Selects the given value.
     */
     select: function(value) {
      var newItem = this._valueToItem(value);
      if (newItem && newItem.hasAttribute('disabled')) {
        return;
      }

      if (this.selected) {
        var oldItem = this._valueToItem(this.selected);

        if (this.selected == value) {
          // If deselecting is allowed we'll have to apply an empty selection.
          // Otherwise, we should force the selection to stay and make this
          // action a no-op.
          if (this.allowEmptySelection) {
            value = '';
          } else {
            if (oldItem)
              oldItem.checked = true;
            return;
          }
        }

        if (oldItem)
          oldItem.checked = false;
      }

      Polymer.IronSelectableBehavior.select.apply(this, [value]);
      this.fire('paper-radio-group-changed');
    },

    _activateFocusedItem: function() {
      this._itemActivate(this._valueForItem(this.focusedItem), this.focusedItem);
    },

    _onUpKey: function(event) {
      this._focusPrevious();
      event.preventDefault();
      this._activateFocusedItem();
    },

    _onDownKey: function(event) {
      this._focusNext();
      event.preventDefault();
      this._activateFocusedItem();
    },

    _onLeftKey: function(event) {
      Polymer.IronMenubarBehaviorImpl._onLeftKey.apply(this, arguments);
      this._activateFocusedItem();
    },

    _onRightKey: function(event) {
      Polymer.IronMenubarBehaviorImpl._onRightKey.apply(this, arguments);
      this._activateFocusedItem();
    }
  });
/** @polymerBehavior */
  Polymer.PaperSpinnerBehavior = {

    listeners: {
      'animationend': '__reset',
      'webkitAnimationEnd': '__reset'
    },

    properties: {
      /**
       * Displays the spinner.
       */
      active: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        observer: '__activeChanged'
      },

      /**
       * Alternative text content for accessibility support.
       * If alt is present, it will add an aria-label whose content matches alt when active.
       * If alt is not present, it will default to 'loading' as the alt value.
       */
      alt: {
        type: String,
        value: 'loading',
        observer: '__altChanged'
      },

      __coolingDown: {
        type: Boolean,
        value: false
      }
    },

    __computeContainerClasses: function(active, coolingDown) {
      return [
        active || coolingDown ? 'active' : '',
        coolingDown ? 'cooldown' : ''
      ].join(' ');
    },

    __activeChanged: function(active, old) {
      this.__setAriaHidden(!active);
      this.__coolingDown = !active && old;
    },

    __altChanged: function(alt) {
      // user-provided `aria-label` takes precedence over prototype default
      if (alt === this.getPropertyInfo('alt').value) {
        this.alt = this.getAttribute('aria-label') || alt;
      } else {
        this.__setAriaHidden(alt==='');
        this.setAttribute('aria-label', alt);
      }
    },

    __setAriaHidden: function(hidden) {
      var attr = 'aria-hidden';
      if (hidden) {
        this.setAttribute(attr, 'true');
      } else {
        this.removeAttribute(attr);
      }
    },

    __reset: function() {
      this.active = false;
      this.__coolingDown = false;
    }
  };
Polymer({
      is: 'paper-spinner',

      behaviors: [
        Polymer.PaperSpinnerBehavior
      ]
    });
(function() {
      // Keeps track of the toast currently opened.
      var currentToast = null;

      Polymer({
        is: 'paper-toast',

        behaviors: [
          Polymer.IronOverlayBehavior
        ],

        properties: {
          /**
           * The element to fit `this` into.
           * Overridden from `Polymer.IronFitBehavior`.
           */
          fitInto: {
            type: Object,
            value: window,
            observer: '_onFitIntoChanged'
          },

          /**
           * The orientation against which to align the dropdown content
           * horizontally relative to `positionTarget`.
           * Overridden from `Polymer.IronFitBehavior`.
           */
          horizontalAlign: {
            type: String,
            value: 'left'
          },

          /**
           * The orientation against which to align the dropdown content
           * vertically relative to `positionTarget`.
           * Overridden from `Polymer.IronFitBehavior`.
           */
          verticalAlign: {
            type: String,
            value: 'bottom'
          },

          /**
           * The duration in milliseconds to show the toast.
           * Set to `0`, a negative number, or `Infinity`, to disable the
           * toast auto-closing.
           */
          duration: {
            type: Number,
            value: 3000
          },

          /**
           * The text to display in the toast.
           */
          text: {
            type: String,
            value: ''
          },

          /**
           * Overridden from `IronOverlayBehavior`.
           * Set to false to enable closing of the toast by clicking outside it.
           */
          noCancelOnOutsideClick: {
            type: Boolean,
            value: true
          },

          /**
           * Overridden from `IronOverlayBehavior`.
           * Set to true to disable auto-focusing the toast or child nodes with
           * the `autofocus` attribute` when the overlay is opened.
           */
          noAutoFocus: {
            type: Boolean,
            value: true
          }
        },

        listeners: {
          'transitionend': '__onTransitionEnd'
        },

        /**
         * Read-only. Deprecated. Use `opened` from `IronOverlayBehavior`.
         * @property visible
         * @deprecated
         */
        get visible() {
          Polymer.Base._warn('`visible` is deprecated, use `opened` instead');
          return this.opened;
        },

        /**
         * Read-only. Can auto-close if duration is a positive finite number.
         * @property _canAutoClose
         */
        get _canAutoClose() {
          return this.duration > 0 && this.duration !== Infinity;
        },

        created: function() {
          this._autoClose = null;
          Polymer.IronA11yAnnouncer.requestAvailability();
        },

        /**
         * Show the toast. Without arguments, this is the same as `open()` from `IronOverlayBehavior`.
         * @param {(Object|string)=} properties Properties to be set before opening the toast.
         * e.g. `toast.show('hello')` or `toast.show({text: 'hello', duration: 3000})`
         */
        show: function(properties) {
          if (typeof properties == 'string') {
            properties = { text: properties };
          }
          for (var property in properties) {
            if (property.indexOf('_') === 0) {
              Polymer.Base._warn('The property "' + property + '" is private and was not set.');
            } else if (property in this) {
              this[property] = properties[property];
            } else {
              Polymer.Base._warn('The property "' + property + '" is not valid.');
            }
          }
          this.open();
        },

        /**
         * Hide the toast. Same as `close()` from `IronOverlayBehavior`.
         */
        hide: function() {
          this.close();
        },

        /**
         * Called on transitions of the toast, indicating a finished animation
         * @private
         */
        __onTransitionEnd: function(e) {
          // there are different transitions that are happening when opening and
          // closing the toast. The last one so far is for `opacity`.
          // This marks the end of the transition, so we check for this to determine if this
          // is the correct event.
          if (e && e.target === this && e.propertyName === 'opacity') {
            if (this.opened) {
              this._finishRenderOpened();
            } else {
              this._finishRenderClosed();
            }
          }
        },

        /**
         * Overridden from `IronOverlayBehavior`.
         * Called when the value of `opened` changes.
         */
        _openedChanged: function() {
          if (this._autoClose !== null) {
            this.cancelAsync(this._autoClose);
            this._autoClose = null;
          }
          if (this.opened) {
            if (currentToast && currentToast !== this) {
              currentToast.close();
            }
            currentToast = this;
            this.fire('iron-announce', {
              text: this.text
            });
            if (this._canAutoClose) {
              this._autoClose = this.async(this.close, this.duration);
            }
          } else if (currentToast === this) {
            currentToast = null;
          }
          Polymer.IronOverlayBehaviorImpl._openedChanged.apply(this, arguments);
        },

        /**
         * Overridden from `IronOverlayBehavior`.
         */
        _renderOpened: function() {
          this.classList.add('paper-toast-open');
        },

        /**
         * Overridden from `IronOverlayBehavior`.
         */
        _renderClosed: function() {
          this.classList.remove('paper-toast-open');
        },

        /**
         * @private
         */
        _onFitIntoChanged: function(fitInto) {
          this.positionTarget = fitInto;
        }

        /**
         * Fired when `paper-toast` is opened.
         *
         * @event 'iron-announce'
         * @param {{text: string}} detail Contains text that will be announced.
         */
      });
    })();
Polymer({
      is: 'paper-tooltip',

      hostAttributes: {
        role: 'tooltip',
        tabindex: -1
      },

      behaviors: [
        Polymer.NeonAnimationRunnerBehavior
      ],

      properties: {
        /**
         * The id of the element that the tooltip is anchored to. This element
         * must be a sibling of the tooltip.
         */
        for: {
          type: String,
          observer: '_forChanged'
        },

        /**
         * Set this to true if you want to manually control when the tooltip
         * is shown or hidden.
         */
        manualMode: {
          type: Boolean,
          value: false
        },

        /**
         * Positions the tooltip to the top, right, bottom, left of its content.
         */
        position: {
          type: String,
          value: 'bottom'
        },

        /**
         * If true, no parts of the tooltip will ever be shown offscreen.
         */
        fitToVisibleBounds: {
          type: Boolean,
          value: false
        },

        /**
         * The spacing between the top of the tooltip and the element it is
         * anchored to.
         */
        offset: {
          type: Number,
          value: 14
        },

        /**
         * This property is deprecated, but left over so that it doesn't
         * break exiting code. Please use `offset` instead. If both `offset` and
         * `marginTop` are provided, `marginTop` will be ignored.
         * @deprecated since version 1.0.3
         */
        marginTop: {
          type: Number,
          value: 14
        },

        /**
         * The delay that will be applied before the `entry` animation is
         * played when showing the tooltip.
         */
        animationDelay: {
          type: Number,
          value: 500
        },

        /**
         * The entry and exit animations that will be played when showing and
         * hiding the tooltip. If you want to override this, you must ensure
         * that your animationConfig has the exact format below.
         */
        animationConfig: {
          type: Object,
          value: function() {
            return {
              'entry': [{
                name: 'fade-in-animation',
                node: this,
                timing: {delay: 0}
              }],
              'exit': [{
                name: 'fade-out-animation',
                node: this
              }]
            }
          }
        },

        _showing: {
          type: Boolean,
          value: false
        }
      },

      listeners: {
        'neon-animation-finish': '_onAnimationFinish',
        'mouseenter': 'hide'
      },

      /**
       * Returns the target element that this tooltip is anchored to. It is
       * either the element given by the `for` attribute, or the immediate parent
       * of the tooltip.
       */
      get target () {
        var parentNode = Polymer.dom(this).parentNode;
        // If the parentNode is a document fragment, then we need to use the host.
        var ownerRoot = Polymer.dom(this).getOwnerRoot();

        var target;
        if (this.for) {
          target = Polymer.dom(ownerRoot).querySelector('#' + this.for);
        } else {
          target = parentNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE ?
              ownerRoot.host : parentNode;
        }

        return target;
      },

      attached: function() {
        this._target = this.target;

        if (this.manualMode)
          return;

        this.listen(this._target, 'mouseenter', 'show');
        this.listen(this._target, 'focus', 'show');
        this.listen(this._target, 'mouseleave', 'hide');
        this.listen(this._target, 'blur', 'hide');
        this.listen(this._target, 'tap', 'hide');
      },

      detached: function() {
        if (this._target && !this.manualMode) {
          this.unlisten(this._target, 'mouseenter', 'show');
          this.unlisten(this._target, 'focus', 'show');
          this.unlisten(this._target, 'mouseleave', 'hide');
          this.unlisten(this._target, 'blur', 'hide');
          this.unlisten(this._target, 'tap', 'hide');
        }
      },

      show: function() {
        // If the tooltip is already showing, there's nothing to do.
        if (this._showing)
          return;

        if (Polymer.dom(this).textContent.trim() === '')
          return;


        this.cancelAnimation();
        this._showing = true;
        this.toggleClass('hidden', false, this.$.tooltip);
        this.updatePosition();

        this.animationConfig.entry[0].timing.delay = this.animationDelay;
        this._animationPlaying = true;
        this.playAnimation('entry');
      },

      hide: function() {
        // If the tooltip is already hidden, there's nothing to do.
        if (!this._showing) {
          return;
        }

        // If the entry animation is still playing, don't try to play the exit
        // animation since this will reset the opacity to 1. Just end the animation.
        if (this._animationPlaying) {
          this.cancelAnimation();
          this._showing = false;
          this._onAnimationFinish();
          return;
        }

        this._showing = false;
        this._animationPlaying = true;
        this.playAnimation('exit');
      },

      _forChanged: function() {
        this._target = this.target;
      },

      updatePosition: function() {
        if (!this._target || !this.offsetParent)
          return;

        var offset = this.offset;
        // If a marginTop has been provided by the user (pre 1.0.3), use it.
        if (this.marginTop != 14 && this.offset == 14)
          offset = this.marginTop;

        var parentRect = this.offsetParent.getBoundingClientRect();
        var targetRect = this._target.getBoundingClientRect();
        var thisRect = this.getBoundingClientRect();

        var horizontalCenterOffset = (targetRect.width - thisRect.width) / 2;
        var verticalCenterOffset = (targetRect.height - thisRect.height) / 2;

        var targetLeft = targetRect.left - parentRect.left;
        var targetTop = targetRect.top - parentRect.top;

        var tooltipLeft, tooltipTop;

        switch (this.position) {
          case 'top':
            tooltipLeft = targetLeft + horizontalCenterOffset;
            tooltipTop = targetTop - thisRect.height - offset;
            break;
          case 'bottom':
            tooltipLeft = targetLeft + horizontalCenterOffset;
            tooltipTop = targetTop + targetRect.height + offset;
            break;
          case 'left':
            tooltipLeft = targetLeft - thisRect.width - offset;
            tooltipTop = targetTop + verticalCenterOffset;
            break;
          case 'right':
            tooltipLeft = targetLeft + targetRect.width + offset;
            tooltipTop = targetTop + verticalCenterOffset;
            break;
        }

        // TODO(noms): This should use IronFitBehavior if possible.
        if (this.fitToVisibleBounds) {
          // Clip the left/right side.
          if (tooltipLeft + thisRect.width > window.innerWidth) {
            this.style.right = '0px';
            this.style.left = 'auto';
          } else {
            this.style.left = Math.max(0, tooltipLeft) + 'px';
            this.style.right = 'auto';
          }

          // Clip the top/bottom side.
          if (tooltipTop + thisRect.height > window.innerHeight) {
            this.style.bottom = '0px';
            this.style.top = 'auto';
          } else {
            this.style.top = Math.max(0, tooltipTop) + 'px';
            this.style.bottom = 'auto';
          }
        } else {
          this.style.left = tooltipLeft + 'px';
          this.style.top = tooltipTop + 'px';
        }

      },

      _onAnimationFinish: function() {
        this._animationPlaying = false;
        if (!this._showing) {
          this.toggleClass('hidden', true, this.$.tooltip);
        }
      },
    });
(function() {

		function capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}

		Polymer({

			is: 'social-media-icons',

			properties: {

				/**
				 * The `icon` attribute grabs a vector-shaped logo of social media you choose
				 *
				 * @attribute icon
				 * @type string
				 * @default 'github'
				 */

				icon: {
					type: String,
					value: 'github',
					notify: true,
					reflectToAttribute: true,
					observer: '_getPath'
				},

				/**
				 * The `size` attribute sets a size of an element
				 *
				 * @attribute size
				 * @type int
				 * @default 32
				 */

				size: {
					type: Number,
					value: 32,
					notify: true,
					reflectToAttribute: true
				},

				/**
				 * The `color` attribute fills the shape with a color you choose
				 *
				 * @attribute color
				 * @type hex
				 * @default undefined
				 */

				color: {
					type: String,
					notify: true,
					reflectToAttribute: true
				},

				/**
				 * The `title` attribute changes the title
				 *
				 * @attribute change
				 * @type string
				 */

				title: {
					type: String,
					notify: true,
					reflectToAttribute: true
				}
			},

			_setWidthAndHeight: function(size) {
				return 'width: ' + size + 'px; height: ' + size + 'px;';
			},

			_setTitle: function(icon) {
				return capitalizeFirstLetter(icon) + ' Logo';
			},

			_getTitle: function(title, icon) {
				return (icon.length > 0) ? this.title : _setTitle(icon);
			},

			_getPath: function() {
				switch (this.icon) {
					case 'dribbble':
						this.path =
							'M16,32C7.2,32,0,24.8,0,16C0,7.2,7.2,0,16,0c8.8,0,16,7.2,16,16C32,24.8,24.8,32,16,32L16,32z M29.5,18.2 C29,18,25.3,16.9,21,17.6c1.8,4.9,2.5,8.9,2.7,9.7C26.7,25.3,28.9,22,29.5,18.2L29.5,18.2z M21.3,28.6c-0.2-1.2-1-5.4-2.9-10.4 c0,0-0.1,0-0.1,0c-7.7,2.7-10.5,8-10.7,8.5c 2.3,1.8,5.2,2.9,8.4,2.9C17.9,29.7,19.7,29.3,21.3,28.6L21.3,28.6z M5.8,25.2 c0.3-0.5,4.1-6.7,11.1-9c0.2-0.1,0.4-0.1,0.5-0.2c-0.3-0.8-0.7-1.6-1.1-2.3c-6.8,2-13.4,2-14,1.9c0,0.1,0,0.3,0,0.4 C2.3,19.5,3.7,22.7,5.8,25.2L5.8,25.2z M2.6,13.2c0.6,0,6.2,0,12.6-1.7c-2.3-4-4.7-7.4-5.1-7.9C6.4,5.5,3.5,9,2.6,13.2L2.6,13.2z M12.8,2.7c0.4,0.5,2.9,3.9,5.1,8c4.9-1.8,6.9-4.6,7.2-4.9c-2.4-2.1-5.6-3.4-9.1-3.4C14.9,2.4,13.8,2.5,12.8,2.7L12.8,2.7z M26.6,7.4c-0.3,0.4-2.6,3.3-7.6,5.4c0.3,0.7,0.6,1.3,0.9,2c0.1,0.2,0.2,0.5,0.3,0.7c4.5-0.6,9.1,0.3,9.5,0.4 C29.6,12.7,28.5,9.7,26.6,7.4L26.6,7.4z';
						break;

					case 'facebook':
						this.path =
							'M30.2,0H1.8C0.8,0,0,0.8,0,1.8v28.5c0,1,0.8,1.8,1.8,1.8h15.3V19.6h-4.2v-4.8h4.2v-3.6 c0-4.1,2.5-6.4,6.2-6.4C25.1,4.8,26.6,5,27,5v4.3l-2.6,0c-2,0-2.4,1-2.4,2.4v3.1h4.8l-0.6,4.8h-4.2V32h8.2c1,0,1.8-0.8,1.8-1.8V1.8 C32,0.8,31.2,0,30.2,0z';
						break;

					case 'github':
						this.path =
							'M16,0.4c-8.8,0-16,7.2-16,16c0,7.1,4.6,13.1,10.9,15.2 c0.8,0.1,1.1-0.3,1.1-0.8c0-0.4,0-1.4,0-2.7c-4.5,1-5.4-2.1-5.4-2.1c-0.7-1.8-1.8-2.3-1.8-2.3c-1.5-1,0.1-1,0.1-1 c1.6,0.1,2.5,1.6,2.5,1.6c1.4,2.4,3.7,1.7,4.7,1.3c0.1-1,0.6-1.7,1-2.1c-3.6-0.4-7.3-1.8-7.3-7.9c0-1.7,0.6-3.2,1.6-4.3 c-0.2-0.4-0.7-2,0.2-4.2c0,0,1.3-0.4,4.4,1.6c1.3-0.4,2.6-0.5,4-0.5c1.4,0,2.7,0.2,4,0.5C23.1,6.6,24.4,7,24.4,7 c0.9,2.2,0.3,3.8,0.2,4.2c1,1.1,1.6,2.5,1.6,4.3c0,6.1-3.7,7.5-7.3,7.9c0.6,0.5,1.1,1.5,1.1,3c0,2.1,0,3.9,0,4.4 c0,0.4,0.3,0.9,1.1,0.8C27.4,29.5,32,23.5,32,16.4C32,7.6,24.8,0.4,16,0.4z';
						break;

					case 'googleplus':
						this.path =
							'M32,14.7h-3.3v-3.3H26v3.3h-3.3v2.7H26v3.3h2.7v-3.3H32 M10.7,14v4.2h5.8c-0.4,2.5-2.6,4.3-5.8,4.3c-3.5,0-6.4-3-6.4-6.5 s2.9-6.5,6.4-6.5c1.6,0,3,0.5,4.1,1.6v0l3-3c-1.8-1.7-4.3-2.8-7.1-2.8C4.8,5.3,0,10.1,0,16s4.8,10.7,10.7,10.7 c6.2,0,10.2-4.3,10.2-10.4c0-0.8-0.1-1.5-0.2-2.2C20.7,14,10.7,14,10.7,14z';
						break;

					case 'instagram':
						this.path =
							'M28.2,0H3.8C1.7,0,0,1.7,0,3.8v24.4C0,30.3,1.7,32,3.8,32h24.4c2.1,0,3.8-1.7,3.8-3.8V3.8 C32,1.7,30.3,0,28.2,0z M22.2,4.5c0-0.5,0.4-0.9,0.9-0.9h4.3c0.5,0,0.9,0.4,0.9,0.9v4.3c0,0.5-0.4,0.9-0.9,0.9h-4.3 c-0.5,0-0.9-0.4-0.9-0.9V4.5z M16,9.9c3.4,0,6.2,2.7,6.2,6.1c0,3.4-2.8,6.1-6.2,6.1c-3.4,0-6.2-2.7-6.2-6.1 C9.9,12.6,12.6,9.9,16,9.9z M28.4,27.4c0,0.5-0.4,0.9-0.9,0.9h-23c-0.5,0-0.9-0.4-0.9-0.9V13.5h3c-0.2,0.8-0.3,1.7-0.3,2.6 c0,5.4,4.4,9.7,9.7,9.7c5.4,0,9.7-4.4,9.7-9.7c0-0.9-0.1-1.7-0.3-2.6h3V27.4z';
						break;

					case 'lastfm':
						this.path =
							'M14.1,22.9l-1.2-3.2c0,0-1.9,2.1-4.8,2.1c-2.5,0-4.3-2.2-4.3-5.7c0-4.5,2.3-6.1,4.5-6.1 c3.2,0,4.3,2.1,5.1,4.8l1.2,3.7c1.2,3.6,3.4,6.4,9.7,6.4c4.5,0,7.6-1.4,7.6-5.1c0-3-1.7-4.5-4.8-5.2l-2.3-0.5 c-1.6-0.4-2.1-1-2.1-2.1c0-1.2,1-2,2.6-2c1.8,0,2.7,0.7,2.9,2.2l3.7-0.4c-0.3-3.3-2.6-4.7-6.3-4.7c-3.3,0-6.5,1.2-6.5,5.2 c0,2.5,1.2,4.1,4.3,4.8l2.5,0.6c1.9,0.4,2.5,1.2,2.5,2.3c0,1.4-1.3,1.9-3.8,1.9c-3.7,0-5.2-1.9-6.1-4.6l-1.2-3.7 c-1.5-4.8-4-6.5-8.9-6.5C2.9,7.1,0,10.5,0,16.3c0,5.6,2.9,8.6,8,8.6C12.1,24.9,14.1,22.9,14.1,22.9L14.1,22.9z';
						break;

					case 'linkedin':
						this.path =
							'M29.6,0H2.4C1.1,0,0,1,0,2.3v27.4C0,31,1.1,32,2.4,32h27.3c1.3,0,2.4-1,2.4-2.3V2.3C32,1,30.9,0,29.6,0z M9.5,27.3H4.7V12h4.7V27.3z M7.1,9.9c-1.5,0-2.8-1.2-2.8-2.8c0-1.5,1.2-2.8,2.8-2.8c1.5,0,2.8,1.2,2.8,2.8 C9.9,8.7,8.6,9.9,7.1,9.9z M27.3,27.3h-4.7v-7.4c0-1.8,0-4-2.5-4c-2.5,0-2.8,1.9-2.8,3.9v7.6h-4.7V12H17v2.1h0.1 c0.6-1.2,2.2-2.5,4.5-2.5c4.8,0,5.7,3.2,5.7,7.3V27.3z';
						break;

					case 'medium':
						this.path =
							'M32,7.1h-1.3c-0.5,0-1.1,0.7-1.1,1.1v15.7c0,0.4,0.7,1,1.1,1H32v3.7H20.5v-3.7h2.4V8.4h-0.1l-5.6,20.3h-4.3 L7.3,8.4H7.2v16.5h2.4v3.7H0v-3.7h1.2c0.5,0,1.2-0.6,1.2-1V8.2c0-0.4-0.7-1.1-1.2-1.1H0V3.3h12L15.9,18h0.1l4-14.7h12V7.1z';
						break;

					case 'quora':
						this.path =
							'M23.2,26.6C23.2,26.6,23.2,26.5,23.2,26.6c4-2.5,6.7-7,6.7-12.4C29.9,3.7,23.1,0,16,0 C9.4,0,2.1,5.2,2.1,14.3c0,10.4,6.8,14.3,13.8,14.3c1.1,0,2.2-0.1,3.2-0.4c0,0,0,0,0,0c2.8,5,6.9,3.8,8,3.4c0,0-0.1-0.9-0.4-2.5 C24.8,29,23.9,28,23.2,26.6z M17.8,24.9c-0.6,0.2-1.3,0.2-1.9,0.2c-3.3,0-7.2-1.4-7.2-10.3c0-8.9,4.1-11.3,7.4-11.3 c3.3,0,7.1,2.1,7.1,11c0,4-0.8,6.6-2,8.2c0,0,0,0,0,0c-2.7-3.5-6.3-2.7-7.1-2.3c0,0,0.1,0.8,0.3,2.3 C16.3,22.6,17.2,23.6,17.8,24.9C17.8,24.8,17.8,24.9,17.8,24.9z';
						break;

					case 'pinterest':
						this.path =
							'M16,0C7.2,0,0,7.2,0,16c0,6.8,4.2,12.6,10.2,14.9c-0.1-1.3-0.3-3.2,0.1-4.6c0.3-1.2,1.9-8,1.9-8 s-0.5-1-0.5-2.4c0-2.2,1.3-3.9,2.9-3.9c1.4,0,2,1,2,2.3c0,1.4-0.9,3.4-1.3,5.3c-0.4,1.6,0.8,2.9,2.4,2.9c2.8,0,5-3,5-7.3 c0-3.8-2.8-6.5-6.7-6.5c-4.6,0-7.2,3.4-7.2,6.9c0,1.4,0.5,2.8,1.2,3.7c0.1,0.2,0.1,0.3,0.1,0.5c-0.1,0.5-0.4,1.6-0.4,1.8 C9.5,21.9,9.3,22,9,21.8c-2-0.9-3.2-3.9-3.2-6.2c0-5,3.7-9.7,10.6-9.7c5.6,0,9.9,4,9.9,9.2c0,5.5-3.5,10-8.3,10 c-1.6,0-3.1-0.8-3.7-1.8c0,0-0.8,3.1-1,3.8c-0.4,1.4-1.3,3.1-2,4.2c1.5,0.5,3.1,0.7,4.7,0.7c8.8,0,16-7.2,16-16 C32,7.2,24.8,0,16,0z';
						break;

					case 'skype':
						this.path =
							'M30.9,18.7c0.2-0.9,0.3-1.8,0.3-2.7c0-2-0.4-4-1.2-5.9c-0.8-1.8-1.8-3.4-3.2-4.8c-1.4-1.4-3-2.5-4.8-3.2 C20,1.2,18,0.8,16,0.8c-1,0-1.9,0.1-2.9,0.3c0,0,0,0,0,0c-1.3-0.7-2.7-1-4.2-1C6.6,0,4.3,1,2.6,2.7C0.9,4.3,0,6.6,0,9 c0,1.5,0.4,3,1.1,4.3c-0.1,0.9-0.2,1.7-0.2,2.6c0,2,0.4,4,1.2,5.9c0.8,1.8,1.8,3.4,3.2,4.8c1.4,1.4,3,2.5,4.8,3.2 C12,30.6,14,31,16,31c0.9,0,1.8-0.1,2.6-0.2c1.3,0.8,2.9,1.2,4.4,1.2c2.4,0,4.6-0.9,6.3-2.6c1.7-1.7,2.6-3.9,2.6-6.3 C32,21.5,31.6,20,30.9,18.7z M16.1,25.2c-5.4,0-7.8-2.6-7.8-4.6c0-1,0.7-1.7,1.8-1.7c2.3,0,1.7,3.3,6,3.3c2.2,0,3.4-1.2,3.4-2.4 c0-0.7-0.4-1.5-1.8-1.9l-4.8-1.2c-3.8-1-4.5-3-4.5-5c0-4.1,3.8-5.6,7.4-5.6c3.3,0,7.2,1.8,7.2,4.3c0,1-0.9,1.6-1.9,1.6 c-2,0-1.6-2.7-5.5-2.7c-2,0-3,0.9-3,2.2c0,1.3,1.5,1.7,2.9,2l3.5,0.8c3.9,0.9,4.9,3.1,4.9,5.3C23.7,22.7,21.2,25.2,16.1,25.2z';
						break;

					case 'spotify':
						this.path =
							'M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16c8.8,0,16-7.2,16-16 S24.8,0,16,0z M13.7,8.4c4.7,0,9.6,1,13.3,3.1c0.5,0.3,0.8,0.7,0.8,1.5c0,0.9-0.7,1.5-1.5,1.5c-0.3,0-0.5-0.1-0.8-0.2 c-2.9-1.7-7.4-2.7-11.7-2.7c-2.2,0-4.4,0.2-6.4,0.8c-0.2,0.1-0.5,0.2-0.8,0.2c-0.9,0-1.5-0.7-1.5-1.5c0-0.9,0.5-1.4,1.1-1.5 C8.3,8.7,10.9,8.4,13.7,8.4z M13.3,13.8c4.2,0,8.2,1,11.4,2.9c0.5,0.3,0.7,0.7,0.7,1.3c0,0.7-0.6,1.3-1.2,1.3 c-0.3,0-0.6-0.1-0.8-0.3c-2.6-1.5-6.2-2.6-10.2-2.6c-2,0-3.8,0.3-5.2,0.7c-0.3,0.1-0.5,0.2-0.8,0.2c-0.7,0-1.2-0.6-1.2-1.3 c0-0.7,0.3-1.1,1-1.3C8.8,14.2,10.7,13.8,13.3,13.8z M13.5,19.1c3.5,0,6.6,0.8,9.3,2.4c0.4,0.2,0.6,0.5,0.6,1.1c0,0.6-0.5,1-1,1 c-0.3,0-0.4-0.1-0.7-0.2c-2.3-1.4-5.2-2.1-8.3-2.1c-1.7,0-3.4,0.2-5,0.6c-0.3,0.1-0.6,0.2-0.8,0.2c-0.6,0-1-0.5-1-1 c0-0.7,0.4-1,0.9-1.1C9.5,19.3,11.5,19.1,13.5,19.1z';
						break;

					case 'stumbleupon':
						this.path =
							'M16,0C7.2,0,0,7.2,0,16c0,8.8,7.2,16,16,16c8.8,0,16-7.2,16-16C32,7.2,24.8,0,16,0z M15.8,12.1 c-0.5,0-1,0.4-1,1l0,5.8c0,2.2-1.8,4-4.1,4c-2.3,0-4.1-1.8-4.1-4.1c0,0,0-2.5,0-2.5h3.1v2.5c0,0.5,0.4,1,1,1s1-0.4,1-1v-5.9 c0.1-2.2,1.9-3.9,4.1-3.9c2.2,0,4,1.8,4.1,4v1.3L18,14.8l-1.3-0.6v-1.1C16.8,12.6,16.4,12.1,15.8,12.1z M25,18.9 c0,2.3-1.8,4.1-4.1,4.1c-2.2,0-4.1-1.8-4.1-4.1v-2.6l1.3,0.6l1.9-0.6V19c0,0.5,0.4,1,1,1s1-0.4,1-1v-2.6H25 C25,16.3,25,18.8,25,18.9z';
						break;

					case 'tumblr':
						this.path =
							'M23.7,25.6c-0.6,0.3-1.7,0.5-2.6,0.6C18.5,26.2,18,24.3,18,23V13h6.4V8.2H18V0c0,0-4.6,0-4.7,0 c-0.1,0-0.2,0.1-0.2,0.2c-0.3,2.5-1.4,6.9-6.3,8.6V13H10v10.5c0,3.6,2.6,8.7,9.6,8.5c2.4,0,5-1,5.5-1.9L23.7,25.6z';
						break;

					case 'twitter':
						this.path =
							'M32,6.1c-1.2,0.5-2.4,0.9-3.8,1c1.4-0.8,2.4-2.1,2.9-3.6c-1.3,0.8-2.7,1.3-4.2,1.6C25.7,3.8,24,3,22.2,3 c-3.6,0-6.6,2.9-6.6,6.6c0,0.5,0.1,1,0.2,1.5C10.3,10.8,5.5,8.2,2.2,4.2c-0.6,1-0.9,2.1-0.9,3.3c0,2.3,1.2,4.3,2.9,5.5 c-1.1,0-2.1-0.3-3-0.8c0,0,0,0.1,0,0.1c0,3.2,2.3,5.8,5.3,6.4c-0.6,0.1-1.1,0.2-1.7,0.2c-0.4,0-0.8,0-1.2-0.1 c0.8,2.6,3.3,4.5,6.1,4.6c-2.2,1.8-5.1,2.8-8.2,2.8c-0.5,0-1.1,0-1.6-0.1C2.9,27.9,6.4,29,10.1,29c12.1,0,18.7-10,18.7-18.7 c0-0.3,0-0.6,0-0.8C30,8.5,31.1,7.4,32,6.1z';
						break;

					case 'youtube':
						this.path =
							'M31.7,9.6c0,0-0.3-2.2-1.3-3.2c-1.2-1.3-2.6-1.3-3.2-1.4C22.7,4.7,16,4.7,16,4.7h0c0,0-6.7,0-11.2,0.3 c-0.6,0.1-2,0.1-3.2,1.4c-1,1-1.3,3.2-1.3,3.2S0,12.2,0,14.8v2.4c0,2.6,0.3,5.2,0.3,5.2s0.3,2.2,1.3,3.2c1.2,1.3,2.8,1.2,3.5,1.4 C7.7,27.2,16,27.3,16,27.3s6.7,0,11.2-0.3c0.6-0.1,2-0.1,3.2-1.4c1-1,1.3-3.2,1.3-3.2s0.3-2.6,0.3-5.2v-2.4 C32,12.2,31.7,9.6,31.7,9.6z M12.7,20.2l0-9l8.6,4.5L12.7,20.2z';
						break;

					case 'vimeo':
						this.path =
							'M32,8.5c-0.1,3.1-2.3,7.4-6.5,12.8c-4.4,5.7-8,8.5-11,8.5c-1.9,0-3.4-1.7-4.7-5.2c-0.9-3.2-1.7-6.3-2.6-9.5 c-1-3.4-2-5.2-3.1-5.2c-0.2,0-1.1,0.5-2.5,1.5L0,9.6c1.6-1.4,3.1-2.8,4.7-4.2c2.1-1.8,3.7-2.8,4.7-2.9c2.5-0.2,4,1.5,4.6,5.1 c0.6,3.9,1.1,6.4,1.3,7.3c0.7,3.3,1.5,4.9,2.4,4.9c0.7,0,1.7-1.1,3-3.2c1.3-2.1,2.1-3.7,2.2-4.8c0.2-1.8-0.5-2.7-2.2-2.7 c-0.8,0-1.6,0.2-2.4,0.5c1.6-5.2,4.6-7.7,9-7.5C30.6,2.2,32.2,4.4,32,8.5z';
						break;

					case 'vine':
						this.path =
							'M30,15.9c-0.8,0.2-1.6,0.3-2.3,0.3c-4,0-7.1-2.8-7.1-7.7c0-2.4,0.9-3.7,2.2-3.7c1.3,0,2.1,1.1,2.1,3.4 c0,1.3-0.3,2.7-0.6,3.6c0,0,1.2,2.2,4.6,1.5c0.7-1.6,1.1-3.7,1.1-5.5C30,2.9,27.5,0,22.9,0c-4.7,0-7.5,3.6-7.5,8.4 c0,4.7,2.2,8.8,5.9,10.6c-1.5,3.1-3.5,5.8-5.5,7.8c-3.7-4.5-7-10.4-8.4-22H2c2.5,19.3,10,25.5,12,26.7c1.1,0.7,2.1,0.6,3.1,0.1 c1.6-0.9,6.4-5.7,9.1-11.4c1.1,0,2.5-0.1,3.8-0.4V15.9z';
						break;
				}
			},

			_renderSVG: function() {
				var svg = Polymer.dom(this.$.svg);
				var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

				Polymer.dom(path).setAttribute('fill', this.color);
				Polymer.dom(path).setAttribute('d', this.path);

				svg.appendChild(path);
			},

			// Fires when the `<social-media-icons>` has been fully prepared
			ready: function() {
				// If `color` is not defined in Light DOM, fill the icon with brand color
				if (!this.color) {
					switch (this.icon) {
						case 'dribbble':
							this.color = '#EA4C89';
							break;
						case 'facebook':
							this.color = '#3B5998';
							break;
						case 'github':
							this.color = '#171515';
							break;
						case 'googleplus':
							this.color = '#DB4E3F';
							break;
						case 'instagram':
							this.color = '#3F729B';
							break;
						case 'jsfiddle':
							this.color = '#4679BD';
							break;
						case 'lastfm':
							this.color = '#D51007';
							break;
						case 'linkedin':
							this.color = '#0077B5';
							break;
						case 'medium':
							this.color = '#231F20';
							break;
						case 'quora':
							this.color = '#A72723';
							break;
						case 'pinterest':
							this.color = '#CB2027';
							break;
						case 'skype':
							this.color = '#00AFF0';
							break;
						case 'spotify':
							this.color = '#6AE368';
							break;
						case 'stumbleupon':
							this.color = '#EF4E23';
							break;
						case 'tumblr':
							this.color = '#35465C';
							break;
						case 'twitter':
							this.color = '#55ACEE';
							break;
						case 'youtube':
							this.color = '#E52D27';
							break;
						case 'vimeo':
							this.color = '#1AB7EA';
							break;
						case 'vine':
							this.color = '#00B489';
							break;
						default:
							this.color = '#000000';
							break;
					}
				}

				this._renderSVG();
			}
		});

	})();