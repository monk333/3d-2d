this.bimv = this.bimv || {};
this.bimv.dwg = (function (exports,THREE) {
  'use strict';

  var version = "1.2.128.128";

  let _DEBUG;

  if (typeof global !== 'undefined') {
      _DEBUG = global.DEBUG;
  }

  if (typeof _DEBUG === 'undefined') {
      _DEBUG = true;
  }

  /**
   * Get client point from mouse event
   * @param  {MouseEvent} e - mouse event
   * @return {Object}   return client point
   * @memberOf Util
   */
  function getClientPoint(e) {
      return {
          x: (e.touches ? e.touches[0] : e).clientX,
          y: (e.touches ? e.touches[0] : e).clientY,
      };
  }

  /**
   * Perform a ajax request
   * @param  {String} url          - url
   * @param  {String} responseType - respose type
   * @return {Promise}              return Promise
   * @memberOf Util
   */
  function ajax(url, responseType) {
      return new Promise((resolve, reject) => {
          let xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function (e) {
              if (this.readyState === 4) {
                  if (this.status === 200) {
                      let result = xhr.response;
                      if (responseType === 'json' && typeof result === 'string') {
                          result = JSON.parse(result);
                      }
                      resolve(result);
                  } else {
                      console.log('ajax error:', this.statusText);
                      reject(new Error(`${this.responseURL} ${this.statusText}`));
                  }
              }
          };
          xhr.open('get', url);
          if (responseType) {
              xhr.responseType = responseType;
          }
          xhr.send();
      });
  }

  /**
   * Define property for prototype
   * @param  {Object} object - prototype
   * @param  {Object} property - property
   * @param  {String} property.name - property name
   * @param  {Object} property.value - value
   * @param  {Function} property.get - get function
   * @param  {Boolean} property.noSet - whether need set function
   * @param  {Function} property.set - set function
   * @param  {Function} property.converter - function used to convert value
   * @param  {String} property.dirty - dirty flag, set dirty flag to true when value changed
   * @param  {Function} property.callback - callback function when value changed
   * @memberOf Util
   */
  function defineProperty(object, property) {
      let { name: name$$1 } = property,
          privateName = `_${name$$1}`,
          descriptor;
      object[privateName] = property.value;
      descriptor = {
          configurable: true,
          enumerable: true,
          get: property.get || (function () { return this[privateName]; }),
      };
      if (!property.noSet) {
          descriptor.set = property.set || function (value) {
              let self = this,
                  oldValue = self[privateName];
              if (property.converter) {
                  value = property.converter(value);
              }
              self[privateName] = value;
              if (property.dirty) {
                  self[property.dirty] = true;
              }
              if (property.callback) {
                  property.callback.call(self, oldValue, value);
              }
              self.fire({
                  type: 'change',
                  data: self,
                  property: name$$1,
                  oldValue,
                  newValue: value,
              });
          };
      }
      Object.defineProperty(object, name$$1, descriptor);
  }

  /**
   * Define properties for prototype
   * @param  {Object} object - the prototype object to define properties
   * @param  {Array} properties properties
   * @memberOf Util
   */
  function defineProperties(object, properties) {
      properties.forEach((property) => {
          defineProperty(object, property);
      });
  }


  /**
   * Create a debounced version of function
   * @param  {Function} func - function
   * @return {Function}      return a debounced version of function
   * @memberOf Util
   */
  function debounce(func) {
      let timer;
      return (event) => {
          if (timer) {
              clearTimeout(timer);
          }
          timer = setTimeout(func, 100, event);
      };
  }

  const id = 1;
  const DEBUG = _DEBUG;

  var Util = /*#__PURE__*/Object.freeze({
    getClientPoint: getClientPoint,
    ajax: ajax,
    defineProperty: defineProperty,
    defineProperties: defineProperties,
    debounce: debounce,
    id: id,
    DEBUG: DEBUG,
    version: version
  });

  const api = {

  };

  const db = {};

  /**
   * Trigger is an implements of Observer pattern.
   * Observers can subscribe or listen to Trigger.
   * Trigger maintains a list of listeners.
   * Trigger notifies observers or listeners when state changed or event occurred.
   * @example
   * // create a Trigger
   * let trigger = new Trigger();
   * // or create a subclass which extends Trigger
   * class Subclass extends Trigger {}
   */
  class Trigger {
    constructor() {
      this._listeners = {};
    }

    /**
     * Listener callback function
     * @callback Trigger~callback
     * @param {Object} event - event object
     * @param {String} event.type - event type
     */

    /**
     * Add listener
     * @param {String} type - listener or event type
     * @param {Trigger~callback} listener - callback function
     * @param {Object} thisArg - the scope of listener function
     * @example
     * // use type 'all' to listen to all kind of events
     * trigger.on('all', (event) => {
     *   console.log(event);
     * });
     */
    on(type, listener, thisArg) {
      if (!type || !listener) {
        return this;
      }
      let self = this,
        listeners = self._listeners,
        bundles = listeners[type],
        bundle = {
          listener,
          thisArg,
        },
        _listener = listener._listener || listener;
      if (!bundles) {
        listeners[type] = bundle;
      } else if (Array.isArray(bundles)) {
        if (!bundles.some(item => (item.listener._listener || item.listener) === _listener
          && item.thisArg === bundle.thisArg)) {
          bundles.push(bundle);
        }
      } else if ((bundles.listener._listener || bundles.listener) !== _listener
        || bundles.thisArg !== bundle.thisArg) {
        listeners[type] = [bundles, bundle];
      }
      return self;
    }

    /**
     * Add one-time listener
     * @param {String} type - listener or event type
     * @param {Trigger~callback} listener - callback function
     * @param {Object} thisArg - the scope of listener function
     * @example
     * trigger.once('change', (event) => {
     *   console.log(event);
     * });
     */
    once(type, listener, thisArg) {
      if (!type || !listener) {
        return this;
      }
      let self = this,
        newListener = (event) => {
          listener.call(thisArg, event);
          self.off(type, listener, thisArg);
        };
      newListener._listener = listener;
      self.on(type, newListener, thisArg);
      return self;
    }

    /**
     * Remove listener
     * @param {String} type - listener or event type
     * @param {Trigger~callback} listener - callback function
     * @param {Object} thisArg - the scope of listener function
     * @example
     * let onChange = (event) => {
     *   console.log(event);
     * };
     * trigger.on('change', onChange);
     * trigger.off('change', onChange);
     */
    off(type, listener, thisArg) {
      let self = this,
        listeners = self._listeners,
        bundles = listeners[type];
      if (Array.isArray(bundles)) {
        bundles.some((bundle, i) => {
          if ((bundle.listener._listener || bundle.listener) === listener
            && bundle.thisArg === thisArg) {
            bundles.splice(i, 1);
            return true;
          }
          return false;
        });
      } else if (bundles
        && ((bundles.listener._listener || bundles.listener) === listener
          && bundles.thisArg === thisArg)) {
        delete listeners[type];
      }
      return self;
    }

    /**
     * Notify listeners when state changed or event occurred
     * @param {Object} event - the event to notified
     * @param {String} event.type - event type
     * @example
     * trigger.fire({
     *   type: 'change',
     *   oldValue: 1,
     *   newValue: 2,
     * });
     */
    fire(event) {
      let self = this,
        listeners = self._listeners,
        strictBundles = listeners[event.type],
        allBundles = listeners.all,
        bundles;
      if (Array.isArray(strictBundles)) {
        if (allBundles) {
          bundles = strictBundles.concat(allBundles);
        } else {
          // Important, bundles will be changed if there is a once listener
          bundles = strictBundles.slice();
        }
      } else if (strictBundles) {
        if (allBundles) {
          bundles = [].concat(strictBundles, allBundles);
        } else {
          bundles = strictBundles;
        }
      } else {
        bundles = Array.isArray(allBundles) ? allBundles.slice() : allBundles;
      }
      if (Array.isArray(bundles)) {
        bundles.forEach((bundle) => {
          bundle.listener.call(bundle.thisArg, event);
        });
      } else if (bundles) {
        bundles.listener.call(bundles.thisArg, event);
      }
      return self;
    }
  }

  /**
   * 
   */
  class Project extends Trigger {
      /**
       * 
       * @param {*} options 
       */
      constructor(options) {
          super();
          this._options = options;


      }
  }

  /**
   *
   *
   * @export
   * @class View
   * @extends {Trigger}
   */
  class View extends Trigger {
      constructor(parentOrString, options) {
          super();
          this._options = options;

          // parent
          let parent;
          if (typeof parentOrString === 'string') {
              parent = document.getElementById(parentOrString);
          } else {
              parent = parentOrString;
          }
          parent.tabIndex = 0;
          parent.style.outline = 'none';
          this.parent = parent;
      }

      /**
       * 渲染
       */
      render() {
          console.log('render');
      }
  }

  class Model extends Trigger {
      constructor() {
          super();
          let self = this;
          self._scene = new THREE.Scene();
          self._datas = [];
          self._datasMap = {};
      }

      add(data) {
          let self = this,
              datas = self._datas,
              datasMap = self._datasMap;
          if (self.contains(data)) {
              return self;
          }
          datas.push(data);
          datasMap[data.id] = data;
          data.on('all', self._handleDataChange, self);
          self.fire({
              type: 'add',
              data,
          });
          if (data.children && data.children.length) {
              data.children.forEach((child) => {
                  self.add(child);
              });
          }
          return self;
      }

      remove(data) {
          let self = this,
              datas = self._datas,
              index = datas.indexOf(data);
          if (index >= 0) {
              let { children } = data;
              datas.splice(index, 1);
              delete self._datasMap[data.id];
              data.off('all', self._handleDataChange, self);
              self.fire({
                  type: 'remove',
                  data,
              });
              data.parent = null;
              if (children && children.length) {
                  for (let i = children.length - 1; i >= 0; i--) {
                      self.remove(children[i]);
                  }
              }
          }
          return self;
      }

      _handleDataChange(e) {
          this.fire(e);
      }

      contains(data) {
          return !!this._datasMap[data.id];
      }

      forEach(callback, thisArg) {
          let self = this;
          self._datas.forEach(callback, thisArg);
          return self;
      }

      clear() {
          let self = this,
              datas = self._datas;
          self._datas = [];
          self._datasMap = {};
          self.fire({
              type: 'clear',
              datas,
          });
          return self;
      }

      get(index) {
          return this._datas[index];
      }

      getById(id$$1) {
          return this._datasMap[id$$1];
      }
  }

  defineProperties(Model.prototype, [
      {
          name: 'datas',
          value: null,
          noSet: true,
      },
      {
          name: 'count',
          value: null,
          get() {
              return this._datas.length;
          },
          noSet: true,
      },
      {
          name: 'scene',
          value: null,
          noSet: true,
          get() {
              return this._scene;
          }
      }
  ]);

  /**
   * @author qiao / https://github.com/qiao
   * @author mrdoob / http://mrdoob.com
   * @author alteredq / http://alteredqualia.com/
   * @author WestLangley / http://github.com/WestLangley
   * @author erich666 / http://erichaines.com
   * @author ScieCode / http://github.com/sciecode
   */

  // This set of controls performs orbiting, dollying (zooming), and panning.
  // Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
  //
  //    Orbit - left mouse / touch: one-finger move
  //    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
  //    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

  class DefaultInteraction extends THREE.EventDispatcher {
      constructor(object, domElement, options = {}) {
          super();
          if (domElement === undefined) console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.');
          if (domElement === document) console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');

          this.object = object;
          this.domElement = domElement;

          // Set to false to disable this control
          this.enabled = true;

          // "target" sets the location of focus, where the object orbits around
          this.target = new THREE.Vector3();

          // How far you can dolly in and out ( PerspectiveCamera only )
          this.minDistance = 0;
          this.maxDistance = Infinity;

          // How far you can zoom in and out ( OrthographicCamera only )
          this.minZoom = 0;
          this.maxZoom = Infinity;

          // How far you can orbit vertically, upper and lower limits.
          // Range is 0 to Math.PI radians.
          this.minPolarAngle = 0; // radians
          this.maxPolarAngle = Math.PI; // radians

          // How far you can orbit horizontally, upper and lower limits.
          // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
          this.minAzimuthAngle = - Infinity; // radians
          this.maxAzimuthAngle = Infinity; // radians

          // Set to true to enable damping (inertia)
          // If damping is enabled, you must call controls.update() in your animation loop
          this.enableDamping = false;
          this.dampingFactor = 0.05;

          // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
          // Set to false to disable zooming
          this.enableZoom = true;
          this.zoomSpeed = 1.0;

          // Set to false to disable rotating
          this.enableRotate = true;
          this.rotateSpeed = 1.0;

          // Set to false to disable panning
          this.enablePan = true;
          this.panSpeed = 1.0;
          this.screenSpacePanning = false; // if true, pan in screen-space
          this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

          // Set to true to automatically rotate around the target
          // If auto-rotate is enabled, you must call controls.update() in your animation loop
          this.autoRotate = false;
          this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

          // Set to false to disable use of the keys
          this.enableKeys = true;

          // The four arrow keys
          this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

          // Mouse buttons
          this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };

          // Touch fingers
          this.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

          // for reset
          this.target0 = this.target.clone();
          this.position0 = this.object.position.clone();
          this.zoom0 = this.object.zoom;

          //
          // public methods
          //

          this.getPolarAngle = function () {

              return spherical.phi;

          };

          this.getAzimuthalAngle = function () {

              return spherical.theta;

          };

          this.saveState = function () {

              scope.target0.copy(scope.target);
              scope.position0.copy(scope.object.position);
              scope.zoom0 = scope.object.zoom;

          };

          this.reset = function () {

              scope.target.copy(scope.target0);
              scope.object.position.copy(scope.position0);
              scope.object.zoom = scope.zoom0;

              scope.object.updateProjectionMatrix();
              scope.dispatchEvent(changeEvent);

              scope.update();

              state = STATE.NONE;

          };

          // this method is exposed, but perhaps it would be better if we can make it private...
          this.update = function () {

              var offset = new THREE.Vector3();

              // so camera.up is the orbit axis
              var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
              var quatInverse = quat.clone().inverse();

              var lastPosition = new THREE.Vector3();
              var lastQuaternion = new THREE.Quaternion();

              return function update() {

                  var position = scope.object.position;

                  offset.copy(position).sub(scope.target);

                  // rotate offset to "y-axis-is-up" space
                  offset.applyQuaternion(quat);

                  // angle from z-axis around y-axis
                  spherical.setFromVector3(offset);

                  if (scope.autoRotate && state === STATE.NONE) {

                      rotateLeft(getAutoRotationAngle());

                  }

                  if (scope.enableDamping) {

                      spherical.theta += sphericalDelta.theta * scope.dampingFactor;
                      spherical.phi += sphericalDelta.phi * scope.dampingFactor;

                  } else {

                      spherical.theta += sphericalDelta.theta;
                      spherical.phi += sphericalDelta.phi;

                  }

                  // restrict theta to be between desired limits
                  spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));

                  // restrict phi to be between desired limits
                  spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

                  spherical.makeSafe();


                  spherical.radius *= scale;

                  // restrict radius to be between desired limits
                  spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

                  // move target to panned location

                  if (scope.enableDamping === true) {

                      scope.target.addScaledVector(panOffset, scope.dampingFactor);

                  } else {

                      scope.target.add(panOffset);

                  }

                  offset.setFromSpherical(spherical);

                  // rotate offset back to "camera-up-vector-is-up" space
                  offset.applyQuaternion(quatInverse);

                  position.copy(scope.target).add(offset);

                  scope.object.lookAt(scope.target);

                  if (scope.enableDamping === true) {

                      sphericalDelta.theta *= (1 - scope.dampingFactor);
                      sphericalDelta.phi *= (1 - scope.dampingFactor);

                      panOffset.multiplyScalar(1 - scope.dampingFactor);

                  } else {

                      sphericalDelta.set(0, 0, 0);

                      panOffset.set(0, 0, 0);

                  }

                  scale = 1;

                  // update condition is:
                  // min(camera displacement, camera rotation in radians)^2 > EPS
                  // using small-angle approximation cos(x/2) = 1 - x^2 / 8

                  if (zoomChanged ||
                      lastPosition.distanceToSquared(scope.object.position) > EPS ||
                      8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

                      scope.dispatchEvent(changeEvent);

                      lastPosition.copy(scope.object.position);
                      lastQuaternion.copy(scope.object.quaternion);
                      zoomChanged = false;

                      return true;

                  }

                  return false;

              };

          }();

          this.dispose = function () {

              scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
              scope.domElement.removeEventListener('mousedown', onMouseDown, false);
              scope.domElement.removeEventListener('wheel', onMouseWheel, false);

              scope.domElement.removeEventListener('touchstart', onTouchStart, false);
              scope.domElement.removeEventListener('touchend', onTouchEnd, false);
              scope.domElement.removeEventListener('touchmove', onTouchMove, false);

              document.removeEventListener('mousemove', onMouseMove, false);
              document.removeEventListener('mouseup', onMouseUp, false);

              scope.domElement.removeEventListener('keydown', onKeyDown, false);

              //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

          };

          //
          // internals
          //

          var scope = this;

          var changeEvent = { type: 'change' };
          var startEvent = { type: 'start' };
          var endEvent = { type: 'end' };

          var STATE = {
              NONE: - 1,
              ROTATE: 0,
              DOLLY: 1,
              PAN: 2,
              TOUCH_ROTATE: 3,
              TOUCH_PAN: 4,
              TOUCH_DOLLY_PAN: 5,
              TOUCH_DOLLY_ROTATE: 6
          };

          var state = STATE.NONE;

          var EPS = 0.000001;

          // current position in spherical coordinates
          var spherical = new THREE.Spherical();
          var sphericalDelta = new THREE.Spherical();

          var scale = 1;
          var panOffset = new THREE.Vector3();
          var zoomChanged = false;

          var rotateStart = new THREE.Vector2();
          var rotateEnd = new THREE.Vector2();
          var rotateDelta = new THREE.Vector2();

          var panStart = new THREE.Vector2();
          var panEnd = new THREE.Vector2();
          var panDelta = new THREE.Vector2();

          var dollyStart = new THREE.Vector2();
          var dollyEnd = new THREE.Vector2();
          var dollyDelta = new THREE.Vector2();

          function getAutoRotationAngle() {

              return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

          }

          function getZoomScale() {

              return Math.pow(0.95, scope.zoomSpeed);

          }

          function rotateLeft(angle) {

              sphericalDelta.theta -= angle;

          }

          function rotateUp(angle) {

              sphericalDelta.phi -= angle;

          }

          var panLeft = function () {

              var v = new THREE.Vector3();

              return function panLeft(distance, objectMatrix) {

                  v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
                  v.multiplyScalar(- distance);

                  panOffset.add(v);

              };

          }();

          var panUp = function () {

              var v = new THREE.Vector3();

              return function panUp(distance, objectMatrix) {

                  if (scope.screenSpacePanning === true) {

                      v.setFromMatrixColumn(objectMatrix, 1);

                  } else {

                      v.setFromMatrixColumn(objectMatrix, 0);
                      v.crossVectors(scope.object.up, v);

                  }

                  v.multiplyScalar(distance);

                  panOffset.add(v);

              };

          }();

          // deltaX and deltaY are in pixels; right and down are positive
          var pan = function () {

              var offset = new THREE.Vector3();

              return function pan(deltaX, deltaY) {

                  var element = scope.domElement;

                  if (scope.object.isPerspectiveCamera) {

                      // perspective
                      var position = scope.object.position;
                      offset.copy(position).sub(scope.target);
                      var targetDistance = offset.length();

                      // half of the fov is center to top of screen
                      targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

                      // we use only clientHeight here so aspect ratio does not distort speed
                      panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
                      panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);

                  } else if (scope.object.isOrthographicCamera) {

                      // orthographic
                      panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
                      panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);

                  } else {

                      // camera neither orthographic nor perspective
                      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
                      scope.enablePan = false;

                  }

              };

          }();

          function dollyIn(dollyScale) {

              if (scope.object.isPerspectiveCamera) {

                  scale /= dollyScale;

              } else if (scope.object.isOrthographicCamera) {

                  scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
                  scope.object.updateProjectionMatrix();
                  zoomChanged = true;

              } else {

                  console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                  scope.enableZoom = false;

              }

          }

          function dollyOut(dollyScale) {

              if (scope.object.isPerspectiveCamera) {

                  scale *= dollyScale;

              } else if (scope.object.isOrthographicCamera) {

                  scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
                  scope.object.updateProjectionMatrix();
                  zoomChanged = true;

              } else {

                  console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                  scope.enableZoom = false;

              }

          }

          //
          // event callbacks - update the object state
          //

          function handleMouseDownRotate(event) {

              rotateStart.set(event.clientX, event.clientY);

          }

          function handleMouseDownDolly(event) {

              dollyStart.set(event.clientX, event.clientY);

          }

          function handleMouseDownPan(event) {

              panStart.set(event.clientX, event.clientY);

          }

          function handleMouseMoveRotate(event) {

              rotateEnd.set(event.clientX, event.clientY);

              rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

              var element = scope.domElement;

              rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

              rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

              rotateStart.copy(rotateEnd);

              scope.update();

          }

          function handleMouseMoveDolly(event) {

              dollyEnd.set(event.clientX, event.clientY);

              dollyDelta.subVectors(dollyEnd, dollyStart);

              if (dollyDelta.y > 0) {

                  dollyIn(getZoomScale());

              } else if (dollyDelta.y < 0) {

                  dollyOut(getZoomScale());

              }

              dollyStart.copy(dollyEnd);

              scope.update();

          }

          function handleMouseMovePan(event) {

              panEnd.set(event.clientX, event.clientY);

              panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

              pan(panDelta.x, panDelta.y);

              panStart.copy(panEnd);

              scope.update();

          }


          function handleMouseWheel(event) {

              if (event.deltaY < 0) {

                  dollyOut(getZoomScale());

              } else if (event.deltaY > 0) {

                  dollyIn(getZoomScale());

              }

              scope.update();

          }
          this.handleMouseWheel = handleMouseWheel;

          function handleKeyDown(event) {

              var needsUpdate = false;

              switch (event.keyCode) {

                  case scope.keys.UP:
                      pan(0, scope.keyPanSpeed);
                      needsUpdate = true;
                      break;

                  case scope.keys.BOTTOM:
                      pan(0, - scope.keyPanSpeed);
                      needsUpdate = true;
                      break;

                  case scope.keys.LEFT:
                      pan(scope.keyPanSpeed, 0);
                      needsUpdate = true;
                      break;

                  case scope.keys.RIGHT:
                      pan(- scope.keyPanSpeed, 0);
                      needsUpdate = true;
                      break;

              }

              if (needsUpdate) {

                  // prevent the browser from scrolling on cursor keys
                  event.preventDefault();

                  scope.update();

              }


          }

          function handleTouchStartRotate(event) {

              if (event.touches.length == 1) {

                  rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

              } else {

                  var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
                  var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

                  rotateStart.set(x, y);

              }

          }

          function handleTouchStartPan(event) {

              if (event.touches.length == 1) {

                  panStart.set(event.touches[0].pageX, event.touches[0].pageY);

              } else {

                  var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
                  var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

                  panStart.set(x, y);

              }

          }

          function handleTouchStartDolly(event) {

              var dx = event.touches[0].pageX - event.touches[1].pageX;
              var dy = event.touches[0].pageY - event.touches[1].pageY;

              var distance = Math.sqrt(dx * dx + dy * dy);

              dollyStart.set(0, distance);

          }

          function handleTouchStartDollyPan(event) {

              if (scope.enableZoom) handleTouchStartDolly(event);

              if (scope.enablePan) handleTouchStartPan(event);

          }

          function handleTouchStartDollyRotate(event) {

              if (scope.enableZoom) handleTouchStartDolly(event);

              if (scope.enableRotate) handleTouchStartRotate(event);

          }

          function handleTouchMoveRotate(event) {

              if (event.touches.length == 1) {

                  rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);

              } else {

                  var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
                  var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

                  rotateEnd.set(x, y);

              }

              rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

              var element = scope.domElement;

              rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

              rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

              rotateStart.copy(rotateEnd);

          }

          function handleTouchMovePan(event) {

              if (event.touches.length == 1) {

                  panEnd.set(event.touches[0].pageX, event.touches[0].pageY);

              } else {

                  var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
                  var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

                  panEnd.set(x, y);

              }

              panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

              pan(panDelta.x, panDelta.y);

              panStart.copy(panEnd);

          }

          function handleTouchMoveDolly(event) {

              var dx = event.touches[0].pageX - event.touches[1].pageX;
              var dy = event.touches[0].pageY - event.touches[1].pageY;

              var distance = Math.sqrt(dx * dx + dy * dy);

              dollyEnd.set(0, distance);

              dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));

              dollyIn(dollyDelta.y);

              dollyStart.copy(dollyEnd);

          }

          function handleTouchMoveDollyPan(event) {

              if (scope.enableZoom) handleTouchMoveDolly(event);

              if (scope.enablePan) handleTouchMovePan(event);

          }

          function handleTouchMoveDollyRotate(event) {

              if (scope.enableZoom) handleTouchMoveDolly(event);

              if (scope.enableRotate) handleTouchMoveRotate(event);

          }

          //
          // event handlers - FSM: listen for events and reset state
          //

          function onMouseDown(event) {

              if (scope.enabled === false) return;

              // Prevent the browser from scrolling.

              event.preventDefault();

              // Manually set the focus since calling preventDefault above
              // prevents the browser from setting it automatically.

              scope.domElement.focus ? scope.domElement.focus() : window.focus();

              switch (event.button) {

                  case 0:

                      switch (scope.mouseButtons.LEFT) {

                          case THREE.MOUSE.ROTATE:

                              if (event.ctrlKey || event.metaKey || event.shiftKey) {

                                  if (scope.enablePan === false) return;

                                  handleMouseDownPan(event);

                                  state = STATE.PAN;

                              } else {

                                  if (scope.enableRotate === false) return;

                                  handleMouseDownRotate(event);

                                  state = STATE.ROTATE;

                              }

                              break;

                          case THREE.MOUSE.PAN:

                              if (event.ctrlKey || event.metaKey || event.shiftKey) {

                                  if (scope.enableRotate === false) return;

                                  handleMouseDownRotate(event);

                                  state = STATE.ROTATE;

                              } else {

                                  if (scope.enablePan === false) return;

                                  handleMouseDownPan(event);

                                  state = STATE.PAN;

                              }

                              break;

                          default:

                              state = STATE.NONE;

                      }

                      break;


                  case 1:

                      switch (scope.mouseButtons.MIDDLE) {

                          case THREE.MOUSE.DOLLY:

                              if (scope.enableZoom === false) return;

                              handleMouseDownDolly(event);

                              state = STATE.DOLLY;

                              break;


                          default:

                              state = STATE.NONE;

                      }

                      break;

                  case 2:

                      switch (scope.mouseButtons.RIGHT) {

                          case THREE.MOUSE.ROTATE:

                              if (scope.enableRotate === false) return;

                              handleMouseDownRotate(event);

                              state = STATE.ROTATE;

                              break;

                          case THREE.MOUSE.PAN:

                              if (scope.enablePan === false) return;

                              handleMouseDownPan(event);

                              state = STATE.PAN;

                              break;

                          default:

                              state = STATE.NONE;

                      }

                      break;

              }

              if (state !== STATE.NONE) {

                  document.addEventListener('mousemove', onMouseMove, false);
                  document.addEventListener('mouseup', onMouseUp, false);

                  scope.dispatchEvent(startEvent);

              }

          }

          function onMouseMove(event) {

              if (scope.enabled === false) return;

              event.preventDefault();

              switch (state) {

                  case STATE.ROTATE:

                      if (scope.enableRotate === false) return;

                      handleMouseMoveRotate(event);

                      break;

                  case STATE.DOLLY:

                      if (scope.enableZoom === false) return;

                      handleMouseMoveDolly(event);

                      break;

                  case STATE.PAN:

                      if (scope.enablePan === false) return;

                      handleMouseMovePan(event);

                      break;

              }

          }

          function onMouseUp(event) {

              if (scope.enabled === false) return;

              document.removeEventListener('mousemove', onMouseMove, false);
              document.removeEventListener('mouseup', onMouseUp, false);

              scope.dispatchEvent(endEvent);

              state = STATE.NONE;

          }

          function onMouseWheel(event) {

              if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;

              event.preventDefault();
              event.stopPropagation();

              scope.dispatchEvent(startEvent);

              handleMouseWheel(event);

              scope.dispatchEvent(endEvent);

          }

          function onKeyDown(event) {

              if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;

              handleKeyDown(event);

          }

          function onTouchStart(event) {

              if (scope.enabled === false) return;

              event.preventDefault();

              switch (event.touches.length) {

                  case 1:

                      switch (scope.touches.ONE) {

                          case THREE.TOUCH.ROTATE:

                              if (scope.enableRotate === false) return;

                              handleTouchStartRotate(event);

                              state = STATE.TOUCH_ROTATE;

                              break;

                          case THREE.TOUCH.PAN:

                              if (scope.enablePan === false) return;

                              handleTouchStartPan(event);

                              state = STATE.TOUCH_PAN;

                              break;

                          default:

                              state = STATE.NONE;

                      }

                      break;

                  case 2:

                      switch (scope.touches.TWO) {

                          case THREE.TOUCH.DOLLY_PAN:

                              if (scope.enableZoom === false && scope.enablePan === false) return;

                              handleTouchStartDollyPan(event);

                              state = STATE.TOUCH_DOLLY_PAN;

                              break;

                          case THREE.TOUCH.DOLLY_ROTATE:

                              if (scope.enableZoom === false && scope.enableRotate === false) return;

                              handleTouchStartDollyRotate(event);

                              state = STATE.TOUCH_DOLLY_ROTATE;

                              break;

                          default:

                              state = STATE.NONE;

                      }

                      break;

                  default:

                      state = STATE.NONE;

              }

              if (state !== STATE.NONE) {

                  scope.dispatchEvent(startEvent);

              }

          }

          function onTouchMove(event) {

              if (scope.enabled === false) return;

              event.preventDefault();
              event.stopPropagation();

              switch (state) {

                  case STATE.TOUCH_ROTATE:

                      if (scope.enableRotate === false) return;

                      handleTouchMoveRotate(event);

                      scope.update();

                      break;

                  case STATE.TOUCH_PAN:

                      if (scope.enablePan === false) return;

                      handleTouchMovePan(event);

                      scope.update();

                      break;

                  case STATE.TOUCH_DOLLY_PAN:

                      if (scope.enableZoom === false && scope.enablePan === false) return;

                      handleTouchMoveDollyPan(event);

                      scope.update();

                      break;

                  case STATE.TOUCH_DOLLY_ROTATE:

                      if (scope.enableZoom === false && scope.enableRotate === false) return;

                      handleTouchMoveDollyRotate(event);

                      scope.update();

                      break;

                  default:

                      state = STATE.NONE;

              }

          }

          function onTouchEnd(event) {

              if (scope.enabled === false) return;

              scope.dispatchEvent(endEvent);

              state = STATE.NONE;

          }

          function onContextMenu(event) {

              if (scope.enabled === false) return;

              event.preventDefault();

          }

          //

          scope.domElement.addEventListener('contextmenu', onContextMenu, false);

          scope.domElement.addEventListener('mousedown', onMouseDown, false);
          scope.domElement.addEventListener('wheel', onMouseWheel, false);

          scope.domElement.addEventListener('touchstart', onTouchStart, false);
          scope.domElement.addEventListener('touchend', onTouchEnd, false);
          scope.domElement.addEventListener('touchmove', onTouchMove, false);

          scope.domElement.addEventListener('keydown', onKeyDown, false);

          // make sure element can receive keys.

          if (scope.domElement.tabIndex === - 1) {

              scope.domElement.tabIndex = 0;

          }

          // force an update at start

          this.update();
      }
  }

  /**
   *
   *
   * @export
   * @class View
   * @extends {Trigger}
   */
  class View2D extends View {
      constructor(parentOrString, options) {
          super(parentOrString, options);
          this._debug = {
              /** 
               * @see https://github.com/jeromeetienne/threejs-inspector
               * @see https://chrome.google.com/webstore/detail/threejs-inspector/dnhjfclbfhcbcdfpjaeacomhbdfjbebi
              */
              inspector: options.debug && options.debug.inspector || false,
          };
          this._model = new Model();
          this.initWebGL();
          this.setDefaultInteraction();
          this.render();

      }

      /**
       * 初始化ThreeJS WebGL
       *
       * @memberof View
       */
      initWebGL() {
          if (!this.parent) {
              console.error('no parent div!');
          }
          let SCREEN_WIDTH = this.parent.offsetWidth, SCREEN_HEIGHT = this.parent.offsetHeight;

          // init renderer
          let renderer = this.renderer = new THREE.WebGLRenderer({
              antialias: true,
              alpha: true,
              preserveDrawingBuffer: true,
          });
          renderer.setClearColor(0x414141, 1);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.autoClear = true;
          renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
          this.parent.appendChild(renderer.domElement);

          let scene = this._model.scene;
          if (DEBUG) {
              window.scene = this._model && this._model.scene;
          }


          let camera = this.camera = new THREE.OrthographicCamera(-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, -SCREEN_HEIGHT / 2);

          let viewport = this.calViewport();
          // let camera = this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
          camera.position.set(0, 150, 400);
          camera.lookAt(scene.position);
          scene.add(camera);

          // init LIGHT
          let light = this.light = new THREE.PointLight(0xffffff);
          light.position.set(-100, 150, 100);
          scene.add(light);

          // FLOOR
          let floorTexture = new THREE.TextureLoader().load("./images/checkerboard.jpg");
          floorTexture.wrapS = THREE.RepeatWrapping;
          floorTexture.wrapT = THREE.RepeatWrapping;
          floorTexture.repeat.set(10, 10);
          let floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
          let floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
          let floor = new THREE.Mesh(floorGeometry, floorMaterial);
          floor.position.y = -0.5;
          floor.rotation.x = Math.PI / 2;
          scene.add(floor);

          // SKYBOX/FOG
          let skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
          let skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.DoubleSide });
          let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
          scene.add(skyBox);

          scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

          // CUSTOM //
          let cubeGeometry = new THREE.CubeGeometry(50, 50, 50);
          let cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 1 });
          let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
          cube.position.set(0, 25, 0);
          scene.add(cube);

          let axes = new THREE.AxisHelper(1000);
          scene.add(axes);
      }

      /**
       * 安装默认交互事件
       *
       * @memberof View2D
       */
      setDefaultInteraction() {
          let defaultInteraction = new DefaultInteraction(this.camera, this.parent);
          defaultInteraction.target.x = this.camera.position.x;
          defaultInteraction.target.y = this.camera.position.y;
          defaultInteraction.target.z = 0;
          defaultInteraction.enableRotate = false;
          defaultInteraction.zoomSpeed = 2;
          defaultInteraction.noRotate = true;
          defaultInteraction.reset();
          this.defaultInteraction = defaultInteraction;
      }

      /**
       * 计算Viewport信息
       *
       * @memberof View2D
       */
      calViewport() {
          return {};
      }
      /**
       * render
       */
      render() {
          let renderer = this.renderer, camera = this.camera, scene = this._model.scene;
          requestAnimationFrame(() => {
              this.render();
          });
          renderer.render(scene, camera);
          this.update();
      }

      update() {
          // console.log('update');
      }

      /**
       *处理mosuedown 事件
       *
       * @memberof Markup
       */
      handle_mousedown(e) {
          console.log('view2d:', e);
      }


      handle_mousewheel(e) {
          console.log('view2d:', e);
          console.log(this.defaultInteraction.handleMouseWheel(e));
      }
  }

  /**
   *
   *
   * @export
   * @class View
   * @extends {Trigger}
   */
  class View3D extends View {
      constructor(parentOrString, options) {
          super(parentOrString, options);
          this._debug = {
              /** 
               * @see https://github.com/jeromeetienne/threejs-inspector
               * @see https://chrome.google.com/webstore/detail/threejs-inspector/dnhjfclbfhcbcdfpjaeacomhbdfjbebi
              */
              inspector: options.debug && options.debug.inspector || false,
          };
          this._model = new Model();
          this.initWebGL();
          this.render();

      }

      /**
       * 初始化ThreeJS WebGL
       *
       * @memberof View
       */
      initWebGL() {
          if (!this._parent) {
              console.error('no parent div!');
          }
          let SCREEN_WIDTH = this._parent.clientWidth, SCREEN_HEIGHT = this._parent.clientHeight;

          // init renderer
          let renderer = this.renderer = new THREE.WebGLRenderer({
              antialias: true
          });
          renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
          this._parent.appendChild(renderer.domElement);

          let scene = this._model.scene;
          if (DEBUG) {
              window.scene = this._model && this._model.scene;
          }

          // init camera
          var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
          let camera = this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
          camera.position.set(0, 150, 400);
          camera.lookAt(scene.position);
          scene.add(camera);

          // init LIGHT
          let light = this.light = new THREE.PointLight(0xffffff);
          light.position.set(-100, 150, 100);
          scene.add(light);

          // FLOOR
          let floorTexture = new THREE.TextureLoader().load("./images/checkerboard.jpg");
          floorTexture.wrapS = THREE.RepeatWrapping;
          floorTexture.wrapT = THREE.RepeatWrapping;
          floorTexture.repeat.set(10, 10);
          let floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
          let floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
          let floor = new THREE.Mesh(floorGeometry, floorMaterial);
          floor.position.y = -0.5;
          floor.rotation.x = Math.PI / 2;
          scene.add(floor);

          // SKYBOX/FOG
          let skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
          let skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.DoubleSide });
          let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
          scene.add(skyBox);

          scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

          // CUSTOM //
          let cubeGeometry = new THREE.CubeGeometry(50, 50, 50);
          let cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 1 });
          let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
          cube.position.set(0, 25, 0);
          scene.add(cube);

          let axes = new THREE.AxisHelper(1000);
          scene.add(axes);
      }

      /**
       * render
       */
      render() {
          let renderer = this.renderer, camera = this.camera, scene = this._model.scene;
          requestAnimationFrame(() => {
              this.render();
          });
          renderer.render(scene, camera);
          this.update();
      }

      update() {
          // console.log('update');
      }

      /**
       *处理mosuedown 事件
       *
       * @memberof Markup
       */
      handle_mousedown(e) {
          console.log('view3d:', e);
      }


      handle_mousewheel(e) {
          console.log('view3d:', e);
      }
  }

  /**
   * Trigger is an implements of Observer pattern.
   * Observers can subscribe or listen to Trigger.
   * Trigger maintains a list of listeners.
   * Trigger notifies observers or listeners when state changed or event occurred.
   * @example
   * // create a Trigger
   * let trigger = new Trigger();
   * // or create a subclass which extends Trigger
   * class Subclass extends Trigger {}
   */
  class Trigger$1 {
    constructor() {
      this._listeners = {};
    }

    /**
     * Listener callback function
     * @callback Trigger~callback
     * @param {Object} event - event object
     * @param {String} event.type - event type
     */

    /**
     * Add listener
     * @param {String} type - listener or event type
     * @param {Trigger~callback} listener - callback function
     * @param {Object} thisArg - the scope of listener function
     * @example
     * // use type 'all' to listen to all kind of events
     * trigger.on('all', (event) => {
     *   console.log(event);
     * });
     */
    on(type, listener, thisArg) {
      if (!type || !listener) {
        return this;
      }
      let self = this,
        listeners = self._listeners,
        bundles = listeners[type],
        bundle = {
          listener,
          thisArg,
        },
        _listener = listener._listener || listener;
      if (!bundles) {
        listeners[type] = bundle;
      } else if (Array.isArray(bundles)) {
        if (!bundles.some(item => (item.listener._listener || item.listener) === _listener
          && item.thisArg === bundle.thisArg)) {
          bundles.push(bundle);
        }
      } else if ((bundles.listener._listener || bundles.listener) !== _listener
        || bundles.thisArg !== bundle.thisArg) {
        listeners[type] = [bundles, bundle];
      }
      return self;
    }

    /**
     * Add one-time listener
     * @param {String} type - listener or event type
     * @param {Trigger~callback} listener - callback function
     * @param {Object} thisArg - the scope of listener function
     * @example
     * trigger.once('change', (event) => {
     *   console.log(event);
     * });
     */
    once(type, listener, thisArg) {
      if (!type || !listener) {
        return this;
      }
      let self = this,
        newListener = (event) => {
          listener.call(thisArg, event);
          self.off(type, listener, thisArg);
        };
      newListener._listener = listener;
      self.on(type, newListener, thisArg);
      return self;
    }

    /**
     * Remove listener
     * @param {String} type - listener or event type
     * @param {Trigger~callback} listener - callback function
     * @param {Object} thisArg - the scope of listener function
     * @example
     * let onChange = (event) => {
     *   console.log(event);
     * };
     * trigger.on('change', onChange);
     * trigger.off('change', onChange);
     */
    off(type, listener, thisArg) {
      let self = this,
        listeners = self._listeners,
        bundles = listeners[type];
      if (Array.isArray(bundles)) {
        bundles.some((bundle, i) => {
          if ((bundle.listener._listener || bundle.listener) === listener
            && bundle.thisArg === thisArg) {
            bundles.splice(i, 1);
            return true;
          }
          return false;
        });
      } else if (bundles
        && ((bundles.listener._listener || bundles.listener) === listener
          && bundles.thisArg === thisArg)) {
        delete listeners[type];
      }
      return self;
    }

    /**
     * Notify listeners when state changed or event occurred
     * @param {Object} event - the event to notified
     * @param {String} event.type - event type
     * @example
     * trigger.fire({
     *   type: 'change',
     *   oldValue: 1,
     *   newValue: 2,
     * });
     */
    fire(event) {
      let self = this,
        listeners = self._listeners,
        strictBundles = listeners[event.type],
        allBundles = listeners.all,
        bundles;
      if (Array.isArray(strictBundles)) {
        if (allBundles) {
          bundles = strictBundles.concat(allBundles);
        } else {
          // Important, bundles will be changed if there is a once listener
          bundles = strictBundles.slice();
        }
      } else if (strictBundles) {
        if (allBundles) {
          bundles = [].concat(strictBundles, allBundles);
        } else {
          bundles = strictBundles;
        }
      } else {
        bundles = Array.isArray(allBundles) ? allBundles.slice() : allBundles;
      }
      if (Array.isArray(bundles)) {
        bundles.forEach((bundle) => {
          bundle.listener.call(bundle.thisArg, event);
        });
      } else if (bundles) {
        bundles.listener.call(bundles.thisArg, event);
      }
      return self;
    }
  }

  /**
   *
   *
   * @export
   * @class View
   * @extends {Trigger}
   */
  class Base extends Trigger$1 {
      constructor(parentOrString, options) {
          super();
          this._options = options;

          // parent
          let parent;
          if (typeof parentOrString === 'string') {
              parent = document.getElementById(parentOrString);
          } else {
              parent = parentOrString;
          }
          this._parent = parent;

          let width = parent.offsetWidth, height = parent.offsetHeight;
          let domElement = document.createElement('canvas');
          domElement.id = `${parent.id}-lowerCanvasEl`;
          domElement.style.position = 'absolute';
          domElement.width = width;
          domElement.height = height;
          domElement.style.width = `${width}px;`;
          domElement.style.height = `${height}px;`;
          domElement.style.left = '0px';
          domElement.style.top = '0px';
          parent.appendChild(domElement);
          this.domElement = domElement;

          if (!window.fabric) {
              console.info('please import fabric.js');
              return;
          }

          let canvas = new fabric.Canvas(domElement.id, {
              width,
              height,
              backgroundColor: DEBUG ? 'rgba(0,0,100,0.8)' : 'rgba(0,0,0,0)',
          });
          canvas.upperCanvasEl.id = `${parent.id}-upperCanvasEl`;
          canvas.wrapperEl.id = `${parent.id}-wrapperEl`;

          fabric.util.setStyle(canvas.wrapperEl, {
              width: `${width}px`,
              height: `${height}px`,
              position: 'absolute',
              left: '0px',
              top: '0px',
          });
          this.canvas = canvas;

          if (DEBUG) {
              domElement.style.backgroundColor = 'rgba(100,100,0,0.5)';
              this.debug();
          }
      }

      /**
       * 测试
       */
      debug() {

      }

      /**
       * 渲染
       */
      render() {

      }

      /**
       * 监听屏幕尺寸变化
       */
      resize() {

      }

      /**
       * 清除内部数据
       */
      clear() {

      }

      /**
       * 销毁
       *
       * @memberof Base
       */
      destroy() {

      }
  }

  /**
   *
   *
   * @export
   * @class View
   * @extends {Trigger}
   */
  class Markup extends Base {
      constructor(parentOrString, options) {
          super(parentOrString, options);
      }

      /**
       * 测试
       */
      debug() {
          var rect = new fabric.Rect({
              left: 100,
              top: 100,
              fill: 'red',
              width: 20,
              height: 20
          });

          // "add" rectangle onto canvas
          this.canvas.add(rect);
      }

      /**
       * 渲染
       */
      render() {
          console.log('render');
      }

      /**
       *处理mosuedown 事件
       *
       * @memberof Markup
       */
      handle_mousedown(e) {
          console.log('markup:', e);
      }

      /**
       * zoom center
       *
       * @param {*} e
       * @memberof Markup
       */
      handle_mousewheel(e) {
          console.log('markup:', e);
          let delta = e.deltaY;
          let canvas = this.canvas;
          var zoom = canvas.getZoom();
          zoom = zoom + delta / 200;
          if (zoom > 20) zoom = 20;
          if (zoom < 0.01) zoom = 0.01;
          canvas.setZoom(zoom);
          e.preventDefault();
          e.stopPropagation();
      }
  }

  let html = {
      preventDefault: function (e) {
          if ($Defaults.KEEP_DEFAULT_FUNCTION(e)) {
              return;
          }
          if (e.preventDefault) {
              e.preventDefault();
          } else if (e.preventManipulation) {
              e.preventManipulation();
          } else {
              e.returnValue = false;
          }
      },
      insertAfter: function (e, ref) {
          if (ref) {
              ref.parentNode.insertBefore(e, ref.nextSibling);
          } else {
              e.parentNode.insertBefore(e, e.parentNode.firstChild);
          }
          return e;
      },
      forEach: function (parent, func, scope) {
          if (!$html.isVisible(parent)) {
              return;
          }
          var count = parent.childNodes.length;
          for (var i = 0; i < count; i++) {
              $html.forEach(parent.childNodes[i], func, scope);
          }
          if (scope) {
              func.call(scope, parent);
          } else {
              func(parent);
          }
      },
      setVisible: function (e, visible) {
          e.style.display = visible ? 'block' : 'none';
      },
      isVisible: function (e) {
          return 'style' in e && e.style.display !== 'none';
      },
      release: function (parent) {
          var count = parent.childNodes.length;
          for (var i = 0; i < count; i++) {
              $html.release(parent.childNodes[i]);
          }
          if (count > 0) {
              $html.clear(parent);
          }
          if (parent._pool) {
              parent._pool.release(parent);
          }
      },
      clear: function (e) {
          while (e.firstChild) {
              e.removeChild(e.firstChild);
          }
      },
      setZoom: function (e, zoom) {
          var s = e.style;
          if (s.setProperty) {
              if ($ua.isFirefox) {
                  s.setProperty("-moz-transform", "scale(" + zoom + ")", null);
                  s.setProperty("-moz-transform-origin", "0 0", null);
              } else if ($ua.isOpera) {
                  s.setProperty("-o-transform", "scale(" + zoom + ")", null);
                  s.setProperty("-o-transform-origin", "0 0", null);
              } else if ($ua.isChrome || $ua.isSafari) {
                  s.setProperty("-webkit-transform", "scale(" + zoom + ")", null);
                  s.setProperty("-webkit-transform-origin", "0 0", null);

                  var webkitInvaildateDiv = null;
                  if (e._webkitInvaildateDiv) {
                      webkitInvaildateDiv = e._webkitInvaildateDiv;
                  } else {
                      webkitInvaildateDiv = document.createElement("div");
                      e._webkitInvaildateDiv = webkitInvaildateDiv;
                  }
                  if (!webkitInvaildateDiv.parentNode || webkitInvaildateDiv.parentNode != e) {
                      e.appendChild(webkitInvaildateDiv);
                  } else {
                      e.removeChild(webkitInvaildateDiv);
                  }
              } else if ($ua.isIE) {
                  s.setProperty("-ms-transform", "scale(" + zoom + ")", null);
                  s.setProperty("-ms-transform-origin", "0 0", null);
              } else {
                  s.setProperty("transform", "scale(" + zoom + ")", null);
                  s.setProperty("transform-origin", "0 0", null);
              }
          }
      },
      setRotate: function (e, zoom) {
          var s = e.style;
          if (s.setProperty) {
              if ($ua.isFirefox) {
                  s.setProperty("-moz-transform", "scale(" + zoom + ")", null);
                  s.setProperty("-moz-transform-origin", "0 0", null);
              } else if ($ua.isOpera) {
                  s.setProperty("-o-transform", "scale(" + zoom + ")", null);
                  s.setProperty("-o-transform-origin", "0 0", null);
              } else if ($ua.isChrome || $ua.isSafari) {
                  s.setProperty("-webkit-transform", "scale(" + zoom + ")", null);
                  s.setProperty("-webkit-transform-origin", "0 0", null);

                  var webkitInvaildateDiv = null;
                  if (e._webkitInvaildateDiv) {
                      webkitInvaildateDiv = e._webkitInvaildateDiv;
                  } else {
                      webkitInvaildateDiv = document.createElement("div");
                      e._webkitInvaildateDiv = webkitInvaildateDiv;
                  }
                  if (!webkitInvaildateDiv.parentNode || webkitInvaildateDiv.parentNode != e) {
                      e.appendChild(webkitInvaildateDiv);
                  } else {
                      e.removeChild(webkitInvaildateDiv);
                  }
              } else if ($ua.isIE) {
                  s.setProperty("-ms-transform", "scale(" + zoom + ")", null);
                  s.setProperty("-ms-transform-origin", "0 0", null);
              } else {
                  s.setProperty("transform", "scale(" + zoom + ")", null);
                  s.setProperty("transform-origin", "0 0", null);
              }
          }
      },
      setCSSStyle: function (domObject, styleName, styleValue) {
          domObject.style.setProperty(styleName, styleValue, null);
      },
      removeCSSStyle: function (domObject, styleName) {
          domObject.style.removeProperty(styleName);
      },
      getCSSStyle: function (domObject, styleName) {
          return domObject.style.getPropertyValue(styleName);
      },
      setBorderRaidus: function (e, radius) {
          if ($ua.isFirefox) {
              e.style.MozBorderRadius = radius;
          } else {
              e.style.borderRadius = radius;
          }
      },
      // {map:{1:'male', 2:'female'}, values:[1, 2]}  or  ['male', 'female']
      createSelect: function (info, currentValue) {
          var select = document.createElement('select'), i, value, option;
          if (Array.isArray(info)) {
              for (i = 0; i < info.length; i++) {
                  value = info[i];
                  option = document.createElement('option');
                  option.innerHTML = value;
                  option.setAttribute('value', value);
                  if (value === currentValue) {
                      option.setAttribute('selected', 'true');
                  }
                  select.appendChild(option);
              }
          } else {
              for (i = 0; i < info.values.length; i++) {
                  value = info.values[i];
                  option = document.createElement('option');
                  option.innerHTML = info.map[value];
                  option.setAttribute('value', value);
                  if (value === currentValue) {
                      option.setAttribute('selected', 'true');
                  }
                  select.appendChild(option);
              }
          }
          return select;
      },
      createImg: function (src) {
          var e = document.createElement('img');
          e.style.position = 'absolute';
          if (typeof src === 'string') {
              e.setAttribute('src', src);
          }
          return e;
      },
      createView: function (overflow, keepDefault) {
          var e = document.createElement('div');
          e.style.position = $Defaults.VIEW_POSITION;
          e.style.fontSize = $Defaults.VIEW_FONT_SIZE;
          e.style.fontFamily = $Defaults.VIEW_FONT_FAMILY;
          e.style.cursor = 'default';
          e.style.outline = 'none';
          e.style.textAlign = "left";
          e.style.msTouchAction = "none";
          e.style.touchAction = "none";
          e.tabIndex = 0;

          if (keepDefault) ; else {
              e.onmousedown = $html.preventDefault;
          }
          if (e.style.setProperty) {
              e.style.setProperty("-khtml-user-select", "none", null);
              e.style.setProperty("-webkit-user-select", "none", null);
              e.style.setProperty("-moz-user-select", "none", null);
              e.style.setProperty("-webkit-tap-highlight-color", "rgba(0, 0, 0, 0)", null);
          }
          if (overflow) {
              e.style.overflow = overflow;
          }
          return e;
      },
      createDiv: function () {
          var e = document.createElement('div');
          e.style.position = 'absolute';
          e.style.msTouchAction = "none";
          e.style.touchAction = "none";
          return e;
      },
      createCanvas: function (width, height) {
          width = width || 0;
          height = height || 0;
          if (isNodejs) {
              return new Canvas(width, height);
          } else {
              var e = document.createElement('canvas');
              e.style.position = 'absolute';
              e.style.msTouchAction = "none";
              e.style.touchAction = "none";
              e.width = width;
              e.height = height;
              return e;
          }
      },
      setCanvas: function (c, x, y, w, h) {
          if (arguments.length === 2) {
              y = x.y;
              w = x.width;
              h = x.height;
              x = x.x;
          }
          c.style.left = x + 'px';
          c.style.top = y + 'px';
          c.setAttribute('width', w);
          c.setAttribute('height', h);
          c._viewRect = { x: x, y: y, width: w, height: h };
          var g = c.getContext('2d');
          if (g.shadowBlur !== 0) {
              g.shadowOffsetX = 0;
              g.shadowOffsetY = 0;
              g.shadowBlur = 0;
              g.shadowColor = 'rgba(0,0,0,0.0)';
          }
          g.clearRect(0, 0, w, h);
          g.translate(-x, -y);
          return g;
      },
      setImg: function (img, src, bounds) {
          img.setAttribute('src', src);
          img.style.left = bounds.x + 'px';
          img.style.top = bounds.y + 'px';
          img.style.width = bounds.width + 'px';
          img.style.height = bounds.height + 'px';
          img._viewRect = _twaver.clone(bounds);
      },
      setDiv: function (div, bounds, fillColor, width, outlineColor) {
          width = _twaver.num(width) ? width : 0;
          div.style.left = (bounds.x - width) + 'px';
          div.style.top = (bounds.y - width) + 'px';
          div.style.width = bounds.width + 'px';
          div.style.height = bounds.height + 'px';
          div._viewRect = _twaver.clone(bounds);
          if (fillColor) {
              div.style.backgroundColor = fillColor;
          } else {
              div.style.backgroundColor = '';
          }
          if (width > 0) {
              div.style.border = width + "px " + outlineColor + ' solid';
          } else {
              div.style.border = '';
          }
      },
      changeTypeForMS: function (type) {
          var newType = type;
          if (type.indexOf("MSPointer") === 0 || type.indexOf("pointer") === 0) {
              var mainName;
              if (type.indexOf("MSPointer") === 0) {
                  mainName = type.substring(9, 10).toLowerCase();
                  mainName = mainName + type.substring(10);
              } else {
                  mainName = type.substring(7, 8);
              }
              if (window.MSPointerEvent) {
                  newType = "MSPointer" + mainName.substring(0, 1).toUpperCase() + mainName.substring(1);
              } else if (window.PointerEvent) {
                  newType = "pointer" + mainName;
              }
          }
          return newType;
      },
      addEventListener: function (type, handler, view, scope) {
          type = this.changeTypeForMS(type);
          var name = '_' + type + '_';
          if (scope[name]) {
              return;
          }
          var func = function (e) {
              func.instance[func.method](e);
          };
          func.method = handler;
          func.instance = scope;
          scope[name] = func;
          view.addEventListener(type, func, false);
      },
      removeEventListener: function (type, view, scope) {
          type = this.changeTypeForMS(type);
          var name = '_' + type + '_';
          var func = scope[name];
          if (func) {
              view.removeEventListener(type, func, false);
              delete scope[name];
          }
      },
      isValidEvent: function (view, e) {
          if (!e) {
              return false;
          }
          if (e.target === view) {
              if ($ua.isFirefox) {
                  if (view.clientHeight < view.scrollHeight && e.layerX < 25) {
                      return false;
                  }
                  if (view.clientWidth < view.scrollWidth && e.layerY < 25) {
                      return false;
                  }
              } else {
                  if (e.offsetX > view.clientWidth || e.offsetY > view.clientHeight) {
                      return false;
                  }
              }
          }
          return true;
      },
      getLogicalPoint: function (view, e, zoom, rootDiv) {
          zoom = zoom ? zoom : 1;
          var point;
          var bound = view.getBoundingClientRect();
          if ($ua.isTouchable && e.changedTouches && e.changedTouches.length > 0) {
              //touch
              var touch = e.changedTouches[0];
              var scrollLeft = $ua.isAndroid ? 0 : $touch.scrollLeft();
              var scrollTop = $ua.isAndroid ? 0 : $touch.scrollTop();
              point = {
                  x: (touch.clientX + view.scrollLeft - bound.left - scrollLeft) / zoom,
                  y: (touch.clientY + view.scrollTop - bound.top - scrollTop) / zoom
              };
          } else {
              //pc
              if (!$html.isValidEvent(view, e)) {
                  return null;
              }
              point = { x: (e.clientX - bound.left + view.scrollLeft) / zoom, y: (e.clientY - bound.top + view.scrollTop) / zoom };
          }
          return point;
      },
      handle_mousedown: function (target, e) {
          if ($html.target) {
              $html.handle_mouseup(e);
          }
          window.addEventListener('mousemove', $html.handle_mousemove, false);
          window.addEventListener('mouseup', $html.handle_mouseup, false);
          $html.target = target;
      },
      handle_mousemove: function (e) {
          if ($html.target.handle_mousemove) {
              $html.target.handle_mousemove(e);
          }
          if ($html.target.handleMouseMove) {
              $html.target.handleMouseMove(e);
          }
      },
      handle_mouseup: function (e) {
          if ($html.target.handle_mouseup) {
              $html.target.handle_mouseup(e);
          }
          if ($html.target.handleMouseUp) {
              $html.target.handleMouseUp(e);
          }
          window.removeEventListener('mousemove', $html.handle_mousemove, false);
          window.removeEventListener('mouseup', $html.handle_mouseup, false);
          delete $html.target;
      },
      getClientPoint: function (e) {
          return {
              x: e.clientX,
              y: e.clientY
          };
      },
      windowWidth: function () {
          if (typeof (window.innerWidth) === 'number') {
              return window.innerWidth;
          }
          if (document.documentElement && document.documentElement.clientWidth) {
              return document.documentElement.clientWidth;
          }
          if (document.body && document.body.clientWidth) {
              return document.body.clientWidth;
          }
          return 0;
      },
      windowHeight: function () {
          if (typeof (window.innerHeight) === 'number') {
              return window.innerHeight;
          }
          if (document.documentElement && document.documentElement.clientHeight) {
              return document.documentElement.clientHeight;
          }
          if (document.body && document.body.clientHeight) {
              return document.body.clientHeight;
          }
          return 0;
      }
  };

  /**
   * 交互事件基类
   *
   * @export
   * @class Control
   * @extends {Trigger}
   */
  class Control extends Trigger$1 {
      constructor(domElement, view, plugin, options) {
          super();
          this.domElement = domElement;
          this._view = view; // dwg or bimv view
          this._plugin = plugin; // markup view
          this._options = options; // config 
          if (DEBUG) {
              this.debug();
          }
      }

      /**
       * 安装监听事件
       *
       * @memberof Control
       */
      setUp() {
          let view = this._view;
          let defaultInteraction = view.defaultInteraction;
          defaultInteraction.dispose();
          this.addListener('mousedown', 'mouseover', 'mousemove', 'mousewheel', 'mouseout', 'keydown');
      }

      /**
       * 卸载监听事件
       *
       * @memberof Control
       */
      tearDown() {
          this.removeListener('mousedown', 'mouseover', 'mousemove', 'mouseout', 'mousewheel', 'keydown');
      }

      /**
       *
       *
       * @memberof Control
       */
      handle_mousedown(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('mousedown');
          this._view.handle_mousedown(e);
          this._plugin.handle_mousedown(e);
      }

      handle_mouseover(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('mouseover');
      }

      handle_mousemove(e) {
          e.preventDefault();
          // e.stopPropagation();
          console.log('mousemove');
      }

      handle_mouseout(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('mouseout');
      }

      handle_mousewheel(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('mousewheel');
          this._view.handle_mousewheel(e);
          this._plugin.handle_mousewheel(e);
      }

      handle_keydown(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('keydown');
      }

      addListener() {
          for (var i = 0; i < arguments.length; i++) {
              var type = arguments[i];
              html.addEventListener(type, 'handle_' + type, this.domElement, this);
          }
      }

      removeListener() {
          for (var i = 0; i < arguments.length; i++) {
              html.removeEventListener(arguments[i], this.domElement, this);
          }
      }

      /**
       * 
       *
       * @memberof Control
       */
      debug() {
          console.log(this._view, this._markup, this._options);
      }
  }

  /**
   * 
   */
  class Manager extends Trigger {
      /**
       * 
       * @param {*} options 
       */
      constructor(options) {
          super();
          this._options = options || {
              parent: document.body, // parent div
          };

          let parentOrString = this._options.parent;
          let parent;
          if (typeof parentOrString === 'string') {
              const id$$1 = parentOrString;
              parent = document.getElementById(parentOrString);
              parent.id = id$$1;
          } else {
              parent = parentOrString;
          }

          if(DEBUG) {
              console.log(parent);
              console.log(parent.id);
              console.log(Util);
          }
   
          if(this._options.view === '3d') { // 三维引擎
              this._view3d = new View3D(parent, {

              });
          }else { // 二维引擎
              this._view2d = new View2D(parent, {

              });
          }

          if (this._options.plugins){
              if(this._options.plugins.markup) {
                  this._markup = new Markup(parent, {

                  });
                  let control = new Control(parent,this._view2d, this._markup, {

                  });
                  control.setUp();
              }
              if(this._options.plugins.measure) {
                  this._measure = null;
              }
          }
      }
  }

  exports.Util = Util;
  exports.api = api;
  exports.db = db;
  exports.Project = Project;
  exports.Manager = Manager;
  exports.View2D = View2D;
  exports.View3D = View3D;
  exports.Markup = Markup;

  return exports;

}({},THREE));
