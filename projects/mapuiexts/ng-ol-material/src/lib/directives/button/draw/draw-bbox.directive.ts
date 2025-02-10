import { Directive, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { DestroyRef } from '@angular/core';
import { NolmGetBBoxInteractionService } from '../../../services/interaction/geometry/get-bbox-interaction.service';
import { Feature, Map } from 'ol';
import VectorSource from 'ol/source/Vector';
import { Options as DragBoxOptions } from 'ol/interaction/DragBox';
import { Options as SnapOptions } from 'ol/interaction/Snap';
import { NolmGeomInteractionOptions } from '../../../types/interaction/geometry/get-geometry-options';
import { Polygon } from 'ol/geom';


export interface NolmDrawBBoxOptions {
  map: Map;
  msg?: string;
  source?: VectorSource;
  dragBoxOptions?: DragBoxOptions;
  snapOptions?: SnapOptions;
}

/**
 * Directive to draw a bounding box on the map
 */

@Directive({
  selector: '[NolmDrawBBox]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
    '[disabled]': 'isRunning()',
  },
})
export class NolmDrawBBoxDirective {
  @Input({ required: true }) NolmDrawBBox!: NolmDrawBBoxOptions;
  @Output() onDraw: EventEmitter<Feature<Polygon>> = new EventEmitter<Feature<Polygon>>();
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() onError: EventEmitter<Error> = new EventEmitter<Error>();

  public isRunning = signal(false);
  private getBboxInteraction = inject(NolmGetBBoxInteractionService);
  private destroyRef = inject(DestroyRef);

  constructor() {}

  onClick(): void {
    const map = this.NolmDrawBBox.map;
    const msg = this.NolmDrawBBox.msg;
    const source = this.NolmDrawBBox.source;
    const dragBoxOptions = this.NolmDrawBBox.dragBoxOptions;
    const snapOptions = this.NolmDrawBBox.snapOptions;
    this.isRunning.set(true);
    const subscription = this.getBboxInteraction
      .draw(map, msg, source, dragBoxOptions, snapOptions)
      .subscribe({
        next: (event: NolmGeomInteractionOptions) => {
          if(event.type === 'drawstart') {
            this.onStart.emit();

          } else if(event.type === 'drawinprogress') {
          } else if(event.type === 'drawend') {
            const feature = event.feature as Feature<Polygon>;
            this.onDraw.emit(feature);
          }
          else if (event.type === 'drawabort') {
            this.isRunning.set(false);
            this.onCancel.emit();
          }
        },
        complete: () => {
          this.isRunning.set(false);
        },
        error: (error: Error) => {
          console.error('Error: ', error);
          this.isRunning.set(false);
          this.onError.emit(error);
          throw error;
        },
      });
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}