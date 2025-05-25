import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Feature, Map, MapBrowserEvent, Overlay } from 'ol';
import VectorSource from 'ol/source/Vector';
import {
  DragBoxEvent,
  Options as DragBoxOptions,
} from 'ol/interaction/DragBox';
import Snap, { Options as SnapOptions } from 'ol/interaction/Snap';
import DragBox from 'ol/interaction/DragBox';
import { platformModifierKeyOnly } from 'ol/events/condition';
import { type NolmGeomInteractionOptions } from './interaction-geometry-options.model';

@Injectable({
  providedIn: 'root',
})
export class NolmGetBBoxInteractionService {
  constructor() {}

  draw(
    map: Map,
    msg = 'Ctrl + Pick and drag to draw BBox or &lt;esc&gt; to Cancel',
    source?: VectorSource,
    dragBoxOptions: DragBoxOptions = {
      condition: platformModifierKeyOnly,
    },
    snapOptions?: SnapOptions
  ): Observable<NolmGeomInteractionOptions> {
    const subscription = new Observable(
      (observer: Observer<NolmGeomInteractionOptions>) => {
        const sketch = new Feature();
        // create tooltip and register method to handle pointermove event
        const tooltip = createTooltip(msg);
        map.addOverlay(tooltip);
        map.on('pointermove', pointerMoveHandler);
        // create interaction
        const interaction = createInteraction(map, dragBoxOptions);
        // add snap interaction
        let snap = createSnap(map, snapOptions);
        // register event to cancel the interaction
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

        function drawStartHandler(evt: any) {
          observer.next({ type: 'drawstart' });
        }

        function drawInProgressHandler(evt: DragBoxEvent) {
          observer.next({ type: 'drawinprogress' });
        }

        function drawAbortHandler() {
          observer.next({ type: 'drawabort' });
          observer.complete();
        }

        function drawEndHandler(evt: DragBoxEvent) {
          sketch.setGeometry(evt.target.getGeometry());
          source && source.addFeature(sketch);
          observer.next({ type: 'drawend', feature: sketch });
          observer.complete();
        }

        function createInteraction(map: Map, dragBoxOptions: DragBoxOptions) {
          const dragBox = new DragBox(dragBoxOptions);
          map.addInteraction(dragBox);
          dragBox.on('boxstart', drawStartHandler);
          dragBox.on('boxdrag', drawInProgressHandler);
          dragBox.on('boxend', drawEndHandler);
          dragBox.on('boxcancel', drawAbortHandler);

          return dragBox;
        }

        function removeInteraction(interaction: DragBox) {
          interaction.un('boxstart', drawStartHandler);
          interaction.un('boxdrag', drawInProgressHandler);
          interaction.un('boxend', drawEndHandler);
          interaction.un('boxcancel', drawAbortHandler);
          map.removeInteraction(interaction);
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

        function createSnap(map: Map, snapOptions?: SnapOptions) {
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

        function unsubscribe(): void {
          removeInteraction(interaction);
          snap && map.removeInteraction(snap);
          snap = undefined;
          map.removeOverlay(tooltip);
          map.un('pointermove', pointerMoveHandler);
          document.removeEventListener('keydown', escKeyHandler);
        }

        return {
          unsubscribe,
        };
      }
    );
    return subscription;
  }
}
