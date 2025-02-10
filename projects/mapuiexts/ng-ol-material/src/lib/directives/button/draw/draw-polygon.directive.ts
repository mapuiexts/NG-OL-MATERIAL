import {
  DestroyRef,
  Directive,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Feature, Map } from 'ol';
import { Polygon } from 'ol/geom';
import { Options as DrawOptions } from 'ol/interaction/Draw';
import { Options as SnapOptions } from 'ol/interaction/Snap';
import { Subscription } from 'rxjs';
import { NolmGetPolygonInteractionService } from '../../../services/interaction/geometry/get-polygon-interaction.service';

export interface NolmDrawPolygonOptions {
  map: Map;
  startMsg?: string;
  continueMsg?: string;
  drawOptions: DrawOptions;
  snapOptions?: SnapOptions;
}

@Directive({
  selector: '[nolmDrawPolygon]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
    '[disabled]': 'isRunning',
  },
})
export class NolmDrawPolygonDirective {
  @Input({ required: true }) nolmDrawPolygon!: NolmDrawPolygonOptions;
  @Output() onDraw: EventEmitter<Feature<Polygon>> = new EventEmitter<Feature<Polygon>>();
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() onError: EventEmitter<Error> = new EventEmitter<Error>();

  private polygonInteractionService = inject(NolmGetPolygonInteractionService);
  subscription?: Subscription;
  isRunning = false;
  private destroyRef = inject(DestroyRef);

  constructor() {}

  onClick() {
    this.isRunning = true;

    const map = this.nolmDrawPolygon.map;
    const msg1 =
      this.nolmDrawPolygon.startMsg || 'Select start point on the map';
    const msg2 =
      this.nolmDrawPolygon.continueMsg ||
      'Select next point or dbl-click to finish or &lt;esc&gt; to cancel';
    const drawOptions = this.nolmDrawPolygon.drawOptions;
    const snapOptions = this.nolmDrawPolygon.snapOptions;

    this.subscription = this.polygonInteractionService
      .draw(map, msg1, msg2, drawOptions, snapOptions)
      .subscribe({
        next: (event) => {
          if(event.type === 'drawstart') {
            this.onStart.emit();
          } 
          else if (event.type === 'drawend') {
            const feature = event.feature as Feature<Polygon>;
            this.onDraw.emit(feature);
          }
          else if (event.type === 'drawabort') {
            this.isRunning = false;
            this.onCancel.emit();
          }
        },
        error: (error) => {
          console.error('Error: ', error);
          this.isRunning = false;
          this.onError.emit(error);
          throw error;
        },
        complete: () => {
          this.isRunning = false;
        },
      });
    this.destroyRef.onDestroy(() => {
      this.subscription?.unsubscribe();
    });
  }
}
