import { Trigger } from "../inner/trigger";
import { View2D } from "../view/view2d";
import { View3D } from "../view/view3d";
import { Markup } from '../markup/markup';
import { Control } from '../markup/control';

import * as Util from '../inner/util';


/**
 * 
 */
export class Manager extends Trigger {
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
            const id = parentOrString;
            parent = document.getElementById(parentOrString);
            parent.id = id;
        } else {
            parent = parentOrString;
        }

        if(Util.DEBUG) {
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