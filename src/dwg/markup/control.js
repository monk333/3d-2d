import { Trigger } from "./trigger";
import * as Util from '../inner/util';
import { html } from './html';

/**
 * 交互事件基类
 *
 * @export
 * @class Control
 * @extends {Trigger}
 */
export class Control extends Trigger {
    constructor(domElement, view, plugin, options) {
        super();
        this.domElement = domElement;
        this._view = view; // dwg or bimv view
        this._plugin = plugin; // markup view
        this._options = options; // config 
        if (Util.DEBUG) {
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