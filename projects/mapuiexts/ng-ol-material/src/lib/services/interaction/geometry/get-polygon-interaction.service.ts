import { Injectable } from '@angular/core';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import { Geometry, Polygon } from 'ol/geom';
import { Feature, Map, MapBrowserEvent, Overlay } from 'ol';
import VectorSource from 'ol/source/Vector';
import Snap, { Options as SnapOptions } from 'ol/interaction/Snap';
import Draw, { DrawEvent, Options as DrawOptions } from 'ol/interaction/Draw';
import { unByKey } from 'ol/Observable';
import { Observable, Observer } from 'rxjs';
import { EventsKey } from 'ol/events';

export interface NolmGetPolygonOptions {
  type: 'drawstart' | 'drawend' | 'drawabort' | 'drawinprogress';
  geometry?: Polygon;
}

const defaultStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 0, 0, 0.8)',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.8)',
    }),
  }),
});

@Injectable({
  providedIn: 'root',
})
export class NolmGetPolygonInteractionService {
  constructor() {}

  getSubscription(
    map: Map,
    startMsg = 'Select start point on the map',
    continueMsg = 'Select next point or dbl-click to finish or &lt;esc&gt; to cancel',
    drawOptions: DrawOptions = {
      source: new VectorSource(),
      type: 'Polygon',
      style: defaultStyle,
    },
    snapOptions: SnapOptions | undefined = undefined
  ): Observable<NolmGetPolygonOptions> {
    const subscription = new Observable<NolmGetPolygonOptions>(
      (observer: Observer<NolmGetPolygonOptions>) => {
        let geomListener: EventsKey | EventsKey[] = [];
        // sketch feature initially is undefined
        let sketch: Feature<Geometry> | undefined = undefined;
        // create tooltip and register method to handle pointermove event
        const tooltip = createTooltip(startMsg);
        map.addOverlay(tooltip);
        map.on('pointermove', pointerMoveHandler);
        // create interaction
        const interaction = createInteraction(map, drawOptions);
        // add snap interaction
        let snap = createSnap(snapOptions, map);
        // register method to cancel the interaction if the user press the <esc> key
        document.addEventListener('keydown', escKeyHandler);

        function createTooltip(msg: string) {
          const _tooltipEl = document.createElement('div');
          _tooltipEl.className = 'nolm-ol-tooltip-hidden';
          //create overlay tooltip
          const tooltip = new Overlay({
            element: _tooltipEl,
            offset: [15, 0],
            positioning: 'center-left',
          });
          return tooltip;
        }
        /**
         * Handler to handle the event 'pointermove' fired
         * by ol.Map.
         * Triggered when a pointer is moved. Note that on touch devices
         * this is triggered when the map is panned, so is not the same as
         * mousemove.
         * This handler will reposition the tooltip in the current mouse
         * position
         */
        function pointerMoveHandler(event: MapBrowserEvent<PointerEvent>) {
          if (event.dragging) {
            return;
          }
          let msg = sketch ? continueMsg : startMsg;
          if (tooltip && tooltip.getElement()) {
            const tooltipEl = tooltip.getElement() as HTMLDivElement;
            tooltipEl.innerHTML = msg;
            tooltipEl.className = 'nolm-ol-tooltip';
          }
          if (tooltip) tooltip.setPosition(event.coordinate);
        }

        function createInteraction(map: Map, drawOptions: DrawOptions) {
          const _interaction = new Draw({
            ...drawOptions,
            type: 'Polygon',
          });
          _interaction.on('drawstart', drawStartHandler);
          _interaction.on('drawend', drawEndHandler);
          _interaction.on('drawabort', drawAbortHandler);
          _interaction.setActive(true);
          map.addInteraction(_interaction);
          return _interaction;
        }

        function removeInteraction(_interaction: Draw) {
          _interaction.un('drawstart', drawStartHandler);
          _interaction.un('drawend', drawEndHandler);
          _interaction.un('drawabort', drawAbortHandler);
          map.removeInteraction(_interaction);
        }

        function drawStartHandler(event: DrawEvent) {
          console.log('draw start');
          console.log(event);
          sketch = event.feature;
          const geometry = sketch?.getGeometry() as Polygon;
          geomListener = geometry?.on('change', function (event) {
            observer.next({ type: 'drawinprogress', geometry: geometry });
          });
          observer.next({ type: 'drawstart' });
        }

        function drawEndHandler(event: DrawEvent) {
          if (event.feature) {
            const polygonGeom = event.feature.getGeometry() as Polygon;
            observer.next({
              type: 'drawend',
              geometry: polygonGeom,
            });
            observer.complete();
            console.log('draw end');
            console.log(polygonGeom?.getCoordinates());
          }
        }

        function drawAbortHandler() {
          observer.next({ type: 'drawabort' });
          observer.complete();
          console.log('draw abort');
        }

        function createSnap(snapOptions: any, map: Map) {
          if (snapOptions) {
            const snap = new Snap(snapOptions);
            map.addInteraction(snap);
            return snap;
          } else {
            return undefined;
          }
        }

        /**
         * Event handler to cancel the interaction
         * if the user press the <esc> key
         */
        function escKeyHandler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            drawAbortHandler();
          }
        }

        function unsubscribe() {
          console.log('unsubscribe');
          removeInteraction(interaction);
          snap && map.removeInteraction(snap);
          snap = undefined;
          map.removeOverlay(tooltip);
          map.un('pointermove', pointerMoveHandler);
          document.removeEventListener('keydown', escKeyHandler);
          sketch = undefined;
          unByKey(geomListener);
        }

        return {
          unsubscribe,
        };
      }
    );

    return subscription;
  }
}
