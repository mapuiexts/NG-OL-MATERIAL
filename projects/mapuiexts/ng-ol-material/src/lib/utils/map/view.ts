import { Feature, Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { Layer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { METERS_PER_UNIT as METERS_PER_UNIT } from 'ol/proj';
import { Units } from 'ol/proj/Units';

/**
 * Calculates the scale based on the resolution
 * @param {Map} map
 * @param {number} resolution
 * @returns The scale
 */
export function getScaleFromResolution(
  map: Map,
  resolution: number
): number | undefined {
  const units: Units = map.getView().getProjection().getUnits();
  if (units !== 'pixels' && units !== 'tile-pixels') {
    const dpi = 25.4 / 0.28;
    const mpu = METERS_PER_UNIT[units];
    const scale = resolution * (mpu * 39.37 * dpi);
    return scale;
  } else {
    return undefined;
  }
}

/**
 * Calculates the resolution based on the scale
 * @param {Map} map
 * @param {number} scale
 * @returns The resolution
 */
export function getResolutionFromScale(
  map: Map,
  scale: number
): number | undefined {
  const units = map.getView().getProjection().getUnits();
  if (units !== 'pixels' && units !== 'tile-pixels') {
    const dpi = 25.4 / 0.28;
    const mpu = METERS_PER_UNIT[units];
    const resolution = scale / (mpu * 39.37 * dpi);
    return resolution;
  } else {
    return undefined;
  }
}

/**
 * Zooms to the extent of the map
 * @param {Map} map
 * @param {Extent} extent
 */
export function zoomToExtent(map: Map, extent: Extent) {
  if (extent === null || extent === undefined || extent[0] === Infinity) {
    console.error('Invalid extent. No coordinates found');
    return;
  }
  map.getView().fit(extent, { size: map.getSize() });
  //Change scale if less than 1/500
  const resolution = map.getView().getResolution();
  if (resolution) {
    const scale = getScaleFromResolution(map, resolution);
    if (scale && scale < 500) {
      const resolution = getResolutionFromScale(map, 500);
      map.getView().setResolution(resolution);
    }
  }
}

/**
 * Zoom the map based on the input scale and center coordinate
 *
 * @param {Map} map The map on where the zoom will be performed
 * @param {number} scale The scale
 * @param {Coordinate} coordinate The x coordinate for the center
 */
export function zoomCenter(map: Map, scale: number, coordinate: Coordinate) {
  const resolution = getResolutionFromScale(map, scale);
  map.getView().setCenter(coordinate);
  map.getView().setResolution(resolution);
}

/**
 * Zoom the map based on the layer extent.
 *
 * @param {Map} map The map to be zoomed
 * @param {Layer} layer The layer
 */
export function zoomToLayer(map: Map, layer: Layer) {
  const _layer = layer as any;
  if (_layer.getSource) {
    if (_layer.getSource()?.getFeatures()?.length > 0) {
      const extent = _layer.getSource().getExtent();
      zoomToExtent(map, extent);
    }
  }
}

/**
 * Zoom the map based on the features extent.
 * @param {Map} map The map to be zoomed
 * @param {Feature[]} features The array of features
 */
export const ZoomToFeatures = (map: Map, features: Feature[]) => {
  if (features.length > 0) {
    const newSource = new VectorSource();
    newSource.addFeatures(features);
    const extent = newSource.getExtent();
    zoomToExtent(map, extent);
  }
};