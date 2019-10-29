import { Trigger } from "./trigger";
import * as Util from '../inner/util';

/**
 * 交互事件基类
 *
 * @export
 * @class Control
 * @extends {Trigger}
 */
export class Control extends Trigger {
    constructor(view, markup, options) {
        super();
        this._view = view; // dwg or bimv view
        this._markup = markup; // markup view
        this._options = options; // config 
        if (Util.DEBUG) {
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