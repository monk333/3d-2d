import { Trigger } from "../inner/trigger"

/**
 *
 *
 * @export
 * @class View
 * @extends {Trigger}
 */
export class View extends Trigger {
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