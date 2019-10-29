let _DEBUG;

if (typeof global !== 'undefined') {
    _DEBUG = global.DEBUG;
}

if (typeof _DEBUG === 'undefined') {
    _DEBUG = true;
}

/**
 * @namespace Util
 */

/**
 * Version number
 * @member {String} version
 * @static
 * @memberOf Util
 */
export { version } from '../../../package.json';

/**
 * Get client point from mouse event
 * @param  {MouseEvent} e - mouse event
 * @return {Object}   return client point
 * @memberOf Util
 */
export function getClientPoint(e) {
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
export function ajax(url, responseType) {
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
export function defineProperty(object, property) {
    let { name } = property,
        privateName = `_${name}`,
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
                property: name,
                oldValue,
                newValue: value,
            });
        };
    }
    Object.defineProperty(object, name, descriptor);
}

/**
 * Define properties for prototype
 * @param  {Object} object - the prototype object to define properties
 * @param  {Array} properties properties
 * @memberOf Util
 */
export function defineProperties(object, properties) {
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
export function debounce(func) {
    let timer;
    return (event) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(func, 100, event);
    };
}

export const id = 1;
export const DEBUG = _DEBUG;
