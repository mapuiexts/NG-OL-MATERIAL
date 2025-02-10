import { Feature } from "ol";
import { Geometry } from "ol/geom";

export interface NolmGeomInteractionOptions {
    type: 'drawstart' | 'drawend' | 'drawabort' | 'drawinprogress';
    feature?: Feature<Geometry>;
  }