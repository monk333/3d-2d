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
            if (this._debug.inspector) {
                window.scene = this._model && this._model.scene;
            }
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
        console.log('update');
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
}

/**
 * 交互事件基类
 *
 * @export
 * @class Control
 * @extends {Trigger}
 */
class Control extends Trigger$1 {
    constructor(view, markup, options) {
        super();
        this._view = view; // dwg or bimv view
        this._markup = markup; // markup view
        this._options = options; // config 
        if (DEBUG) {
            this.debug();
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
                new Control(this._view2d, this._markup, {

                });
            }
            if(this._options.plugins.measure) {
                this._measure = null;
            }
        }
    }
}

export { Util, api, db, Project, Manager, View2D, View3D, Markup };
