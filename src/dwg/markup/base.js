import { Trigger } from "./trigger";
import * as Util from '../inner/util';

/**
 *
 *
 * @export
 * @class View
 * @extends {Trigger}
 */
export class Base extends Trigger {
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
        domElement.style.width = `${width}px;`
        domElement.style.height = `${height}px;`
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
            backgroundColor: Util.DEBUG ? 'rgba(0,0,100,0.8)' : 'rgba(0,0,0,0)',
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

        if (Util.DEBUG) {
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