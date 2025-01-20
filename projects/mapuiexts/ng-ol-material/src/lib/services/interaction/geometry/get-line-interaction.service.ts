import { Injectable } from '@angular/core';
import { Feature, Map, MapBrowserEvent, Overlay } from 'ol';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import { Observable, Observer } from 'rxjs';
import { Draw, Snap } from 'ol/interaction';
import { Geometry } from 'ol/geom';
import { LineString } from 'ol/geom';
import { DrawEvent } from 'ol/interaction/Draw';
import { Options as SnapOptions } from 'ol/interaction/Snap';
import { Options as DrawOptions } from 'ol/interaction/Draw';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';

export interface NolmGetLineOptions {
  type: 'drawstart' | 'drawend' | 'drawabort' | 'drawinprogress';
  geometry?: LineString;
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
export class NolmGetLineInteractionService {
  constructor() {}

  getSubscription(
    map: Map,
    startMsg = 'Select start point',
    continueMsg = 'Select next point or dbl-click to add last point (&lt;esc&gt; to cancel)',
    drawOptions: DrawOptions = {
      source: new VectorSource(),
      type: 'LineString',
      style: defaultStyle,
    },
    snapOptions: SnapOptions | undefined = undefined
  ): Observable<NolmGetLineOptions> {
    const subscription = new Observable(
      (observer: Observer<NolmGetLineOptions>) => {
        // create tooltip and register method to handle pointermove event
        const tooltip = createTooltip(startMsg);
        map.addOverlay(tooltip);
        map.on('pointermove', pointerMoveHandler);
        // create interaction
        const interaction = createInteraction(map, drawOptions);
        // add snap interaction
        let snap = createSnap(snapOptions, map);
        // sketch feature initially is undefined
        let sketch: Feature<Geometry> | undefined = undefined;
        // register method to cancel the interaction if the user press the <esc> key
        document.addEventListener('keydown', escKeyHandler);
        let geomListener: EventsKey | EventsKey[] = [];

        function createInteraction(map: Map, drawOptions: DrawOptions) {
          const _interaction = new Draw({
            ...drawOptions,
            type: 'LineString',
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
          const geometry = sketch?.getGeometry() as LineString;
          geomListener = geometry.on('change', function (event) {
            observer.next({ type: 'drawinprogress', geometry: geometry });
          });
          observer.next({ type: 'drawstart' });
        }

        function drawEndHandler(event: DrawEvent) {
          if (event.feature) {
            const lineGeom = event.feature.getGeometry() as LineString;
            observer.next({
              type: 'drawend',
              geometry: lineGeom,
            });
            observer.complete();
            console.log('draw end');
            console.log(lineGeom?.getCoordinates());
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
