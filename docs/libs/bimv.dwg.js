import { WebGLRenderer, PerspectiveCamera, PointLight, TextureLoader, RepeatWrapping, MeshBasicMaterial, DoubleSide, PlaneGeometry, Mesh, CubeGeometry, FogExp2, MeshPhongMaterial, AxisHelper, Scene } from 'three';

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
        this._parent = parent;
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
        self._scene = new Scene();
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
        let renderer = this.renderer = new WebGLRenderer({
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
        let camera = this.camera = new PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.position.set(0, 150, 400);
        camera.lookAt(scene.position);
        scene.add(camera);

        // init LIGHT
        let light = this.light = new PointLight(0xffffff);
        light.position.set(-100, 150, 100);
        scene.add(light);

        // FLOOR
        let floorTexture = new TextureLoader().load("./images/checkerboard.jpg");
        floorTexture.wrapS = RepeatWrapping;
        floorTexture.wrapT = RepeatWrapping;
        floorTexture.repeat.set(10, 10);
        let floorMaterial = new MeshBasicMaterial({ map: floorTexture, side: DoubleSide });
        let floorGeometry = new PlaneGeometry(1000, 1000, 10, 10);
        let floor = new Mesh(floorGeometry, floorMaterial);
        floor.position.y = -0.5;
        floor.rotation.x = Math.PI / 2;
        scene.add(floor);

        // SKYBOX/FOG
        let skyBoxGeometry = new CubeGeometry(10000, 10000, 10000);
        let skyBoxMaterial = new MeshBasicMaterial({ color: 0x9999ff, side: DoubleSide });
        let skyBox = new Mesh(skyBoxGeometry, skyBoxMaterial);
        scene.add(skyBox);

        scene.fog = new FogExp2(0x9999ff, 0.00025);

        // CUSTOM //
        let cubeGeometry = new CubeGeometry(50, 50, 50);
        let cubeMaterial = new MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 1 });
        let cube = new Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, 25, 0);
        scene.add(cube);

        let axes = new AxisHelper(1000);
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
        console.log('view2d:', e);
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

        let model = new fabric.Canvas(domElement.id, {
            width,
            height,
            backgroundColor: DEBUG ? 'rgba(0,0,100,0.8)' : 'rgba(0,0,0,0)',
        });
        model.upperCanvasEl.id = `${parent.id}-upperCanvasEl`;
        model.wrapperEl.id = `${parent.id}-wrapperEl`;

        fabric.util.setStyle(model.wrapperEl, {
            width: `${width}px`,
            height: `${height}px`,
            position: 'absolute',
            left: '0px',
            top: '0px',
        });
        this.model = model;

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
        this.model.add(rect);
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
        e.stopPropagation();
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

export { Util, api, db, Project, Manager, View2D, View3D, Markup };
