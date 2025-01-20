import { Injectable, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Map, Overlay } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { Options as DrawOptions } from 'ol/interaction/Draw';
import { Feature } from 'ol';
import Geometry from 'ol/geom/Geometry';
import { LineString, Polygon } from 'ol/geom';
import { getLength, getArea } from 'ol/sphere';
import { NolmGetLineInteractionService } from '../interaction/geometry/get-line-interaction.service';
import { NolmGetPolygonInteractionService } from '../interaction/geometry/get-polygon-interaction.service';

@Injectable({
  providedIn: 'root',
})
export class NolmMeasureService {
  private lineInteractionService = inject(NolmGetLineInteractionService);
  private polygonInteractionService = inject(NolmGetPolygonInteractionService);
  private vectorLayer: VectorLayer<Feature> | undefined;
  private overlays: Overlay[] = [];
  private style = new Style({
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.2)',
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.5)',
      lineDash: [10, 10],
      width: 2,
    }),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });

  constructor() {}

  getDistance(map: Map) {
    console.log('getDistance');
    let isRunning = false;
    const source = this.getLayer(map).getSource() as
      | VectorSource<Feature<Geometry>>
      | undefined;
    const measureOvelay = this.createMeasureOverlay(map);
    const drawOptions: DrawOptions = {
      source: source,
      type: 'LineString',
      style: this.style,
    };
    const snapOptions = {
      source: source,
      edge: true,
      vertex: true,
    };
    let subscription: Subscription = this.lineInteractionService
      .getSubscription(
        map,
        'Click point to start length measure',
        'Click next point to continue or dbl-click to add last point (&lt;esc&gt; to cancel)', 
        drawOptions,
        snapOptions
      )
      .subscribe({
        next: (event) => {
          if (event.type === 'drawend') {
            const overlayElement = measureOvelay.getElement();
            if (overlayElement) {
              overlayElement.className =
                'nolm-ol-tooltip nolm-ol-tooltip-static';
              measureOvelay.setOffset([0, -7]);
            }
            this.overlays.push(measureOvelay);
          } else if (event.type === 'drawinprogress') {
            const geometry = event.geometry;
            const output = this.formatLength(geometry as LineString);
            const tooltip = measureOvelay.getElement();
            if (tooltip) {
              tooltip.innerHTML = output;
              measureOvelay.setPosition(
                (geometry as LineString).getLastCoordinate()
              );
            }
          } else if (event.type === 'drawabort') {
            this.clearMeasureOverlay(map, measureOvelay);
          }
        },
        complete: () => {
          console.log('complete');
          isRunning = false;
          subscription.unsubscribe();
        },
      });
  }

  getArea(map: Map) {
    console.log('getArea');
    let isRunning = false;
    const source = this.getLayer(map).getSource() as
      | VectorSource<Feature<Geometry>>
      | undefined;
    const measureOvelay = this.createMeasureOverlay(map);
    const drawOptions: DrawOptions = {
      source: source,
      type: 'Polygon',
      style: this.style,
    };
    const snapOptions = {
      source: source,
      edge: true,
      vertex: true,
    };
    let subscription: Subscription = this.polygonInteractionService
      .getSubscription(
        map,
        'Click point to start area measure',
        'Click next point or select last point to finish (&lt;esc&gt; to cancel)', 
        drawOptions,
        snapOptions
      )
      .subscribe({
        next: (event) => {
          if (event.type === 'drawend') {
            const overlayElement = measureOvelay.getElement();
            if (overlayElement) {
              overlayElement.className =
                'nolm-ol-tooltip nolm-ol-tooltip-static';
              measureOvelay.setOffset([0, -7]);
            }
            this.overlays.push(measureOvelay);
          } else if (event.type === 'drawinprogress') {
            const geometry = event.geometry;
            console.log('geometry', geometry);
            if (geometry instanceof Polygon) {
              const output = this.formatArea(geometry as Polygon);
              const tooltip = measureOvelay.getElement();
              if (tooltip) {
                tooltip.innerHTML = output;
                measureOvelay.setPosition(
                  (geometry as Polygon).getInteriorPoint().getCoordinates()
                );
              }
            }
          } else if (event.type === 'drawabort') {
            this.clearMeasureOverlay(map, measureOvelay);
          }
        },
        complete: () => {
          console.log('complete');
          isRunning = false;
          subscription.unsubscribe();
        },
      });
  }

  clearMeasure(map: Map) {
    if (this.vectorLayer) {
      map.removeLayer(this.vectorLayer);
      this.vectorLayer = undefined;
    }
    this.overlays.forEach((overlay) => {
      this.clearMeasureOverlay(map, overlay);
    });
  }

  private getLayer(map: Map): VectorLayer<Feature> {
    if (!this.vectorLayer) {
      const source = new VectorSource();
      this.vectorLayer = new VectorLayer({
        source: source,
        style: {
          'fill-color': 'rgba(255, 204, 51, 0.2)',
          'stroke-color': '#ffcc33',
          'stroke-width': 2,
          'circle-radius': 7,
          'circle-fill-color': '#ffcc33',
        },
        properties: {
          name: 'Measure',
        },
      });
      map.addLayer(this.vectorLayer);
    }
    return this.vectorLayer;
  }

  private createMeasureOverlay(map: Map) {
    const measureOverlayElement = document.createElement('div');
    measureOverlayElement.className = 'nolm-ol-tooltip nolm-ol-tooltip-measure';
    const measureOverlay = new Overlay({
      element: measureOverlayElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
      insertFirst: false,
    });
    map.addOverlay(measureOverlay);
    return measureOverlay;
  }

  private clearMeasureOverlay(map: Map, overlay: Overlay) {
    overlay.getElement()?.remove();
    map.removeOverlay(overlay);
  }

  private formatLength(line: LineString) {
    const length = getLength(line);
    let output;
    if (length > 1000) {
      output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
      output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
  }

  private formatArea(polygon: Polygon) {
    const area = getArea(polygon);
    let output;
    if (area > 10000) {
      output =
        Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
  }
}
