import { Trigger } from "./trigger";
import * as Util from '../inner/util';
import { Base } from "./base";

/**
 *
 *
 * @export
 * @class View
 * @extends {Trigger}
 */
export class Markup extends Base {
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