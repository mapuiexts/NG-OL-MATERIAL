import {
  DestroyRef,
  Directive,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Map, Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Options as DrawOptions } from 'ol/interaction/Draw';
import { Options as SnapOptions } from 'ol/interaction/Snap';
import { NolmGetLineStringInteractionService } from '../../../services/interaction/geometry/get-linestring-interaction.service';
import { Subscription } from 'rxjs';

export interface NolmDrawLineStringOptions {
  map: Map;
  startMsg?: string;
  continueMsg?: string;
  drawOptions: DrawOptions;
  snapOptions?: SnapOptions;
}

@Directive({
  selector: '[nolmDrawLineString]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
    '[disabled]': 'isRunning',
  },
})
export class NolmDrawLineStringDirective {
  @Input({ required: true }) nolmDrawLineString!: NolmDrawLineStringOptions;
  @Output() onDraw: EventEmitter<Feature<LineString>> = new EventEmitter<Feature<LineString>>();
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() onError: EventEmitter<Error> = new EventEmitter<Error>();

  private lineInteractionService = inject(NolmGetLineStringInteractionService);
  private subscription?: Subscription;
  isRunning = false;
  private destroyRef = inject(DestroyRef);

  constructor() {}

  onClick() {
    this.isRunning = true;
    const map = this.nolmDrawLineString.map;
    const msg1 = this.nolmDrawLineString.startMsg || 'Select start point';
    const msg2 =
      this.nolmDrawLineString.continueMsg ||
      'Select next point or dbl-click to add last point (&lt;esc&gt; to cancel)';
    const drawOptions = this.nolmDrawLineString.drawOptions;
    const snapOptions = this.nolmDrawLineString.snapOptions;

    this.subscription = this.lineInteractionService
      .draw(map, msg1, msg2, drawOptions, snapOptions)
      .subscribe({
        next: (event) => {
          if(event.type === 'drawstart') {
            this.onStart.emit();
          } 
          else if (event.type === 'drawend') {
            const feature = event.feature as Feature<LineString>;
            this.onDraw.emit(feature);
          }
          else if (event.type === 'drawabort') {
            this.isRunning = false;
            this.onCancel.emit();
          }
        },
        complete: () => {
          this.isRunning = false;
        },
        error: (error) => {
          console.error('Error: ', error);
          this.isRunning = false;
          this.onError.emit(error);
          throw error;
        },
      });
    this.destroyRef.onDestroy(() => {
      this.subscription?.unsubscribe();
    });
  }

}
