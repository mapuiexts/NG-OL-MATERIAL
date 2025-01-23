import { Injectable } from '@angular/core';
import { Observer, Observable } from 'rxjs';
import { Feature, Map, MapBrowserEvent, Overlay } from 'ol';
import { Draw } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';
import { Style, Fill, Circle } from 'ol/style';
import { Geometry, Point } from 'ol/geom';
import { DrawEvent, Options as DrawOptions } from 'ol/interaction/Draw';
import Snap, { Options as SnapOptions } from 'ol/interaction/Snap';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';

export interface NolmGetPointOptions {
  type: 'drawstart' | 'drawend' | 'drawabort' | 'drawinprogress';
  geometry?: Point;
}

const defaultStyle = new Style({
  image: new Circle({
    radius: 5,
    fill: new Fill({
      color: '#ffcc33',
    }),
  }),
});

const defaultMsg = 'Select Point (&lt;esc&gt; to Cancel)';

@Injectable({
  providedIn: 'root',
})
export class NolmGetPointInteractionService {
  constructor() {}

  getSubscription(
    map: Map,
    msg = defaultMsg,
    drawOptions: DrawOptions = {
      source: new VectorSource(),
      type: 'Point',
      style: defaultStyle,
    },
    snapOptions: SnapOptions | undefined = undefined
  ): Observable<NolmGetPointOptions> {
    const subscription = new Observable(
      (observer: Observer<NolmGetPointOptions>) => {
        //create interaction
        const interaction = createInteraction(map, drawOptions);
        // add snap interaction
        let snap = createSnap(snapOptions, map);
        // sketch feature initially is undefined
        let sketch: Feature<Geometry> | undefined = undefined;
        //create tooltip and register method to move it based on mouse position
        const tooltip = createTooltip(msg);
        map.addOverlay(tooltip);
        map.on('pointermove', pointerMoveHandler);
        //register method to cancel the interaction if the user press the <esc> key
        document.addEventListener('keydown', escKeyHandler);
        let geomListener: EventsKey | EventsKey[] = [];

        function createInteraction(map: Map, drawOptions: DrawOptions) {
          const _interaction = new Draw({
            ...drawOptions,
            type: 'Point',
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
          sketch = event.feature;
          const geometry = sketch?.getGeometry() as Point;
          geomListener = geometry.on('change', function (event) {
            observer.next({ type: 'drawinprogress', geometry: geometry });
          });
          observer.next({ type: 'drawstart' });
        }

        function drawEndHandler(event: DrawEvent) {
          if (event.feature) {
            const pointGeom = event.feature.getGeometry() as Point;
            observer.next({
              type: 'drawend',
              geometry: pointGeom,
            });
            observer.complete();
          }
        }

        function drawAbortHandler() {
          observer.next({ type: 'drawabort' });
          observer.complete();
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
