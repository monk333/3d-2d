import * as THREE from 'three';
import { Trigger } from "../inner/trigger"
import { View } from './view';
import { Model } from '../model/model';

/**
 *
 *
 * @export
 * @class View
 * @extends {Trigger}
 */
export class View3D extends View {
    constructor(parentOrString, options) {
        super(parentOrString, options);
    }
}