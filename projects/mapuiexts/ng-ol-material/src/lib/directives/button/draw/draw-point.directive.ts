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
import { Point } from 'ol/geom';
import { Options as DrawOptions } from 'ol/interaction/Draw';
import { Options as SnapOptions } from 'ol/interaction/Snap';
import { NolmGetPointInteractionService } from '../../../services/interaction/geometry/get-point-interaction.service';
import { Subscription } from 'rxjs';

export interface NolmDrawPointOptions {
  map: Map;
  msg?: string;
  drawOptions: DrawOptions;
  snapOptions?: SnapOptions;
}

@Directive({
  selector: '[nolmDrawPoint]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
    '[disabled]': 'isRunning',
  },
})
export class NolmDrawPointDirective {
  @Input({ required: true }) nolmDrawPoint!: NolmDrawPointOptions;
  @Output() onDraw: EventEmitter<Feature<Point>> = new EventEmitter<Feature<Point>>();
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() onError: EventEmitter<Error> = new EventEmitter<Error>();

  private pointInteractionService = inject(NolmGetPointInteractionService);
  subscription?: Subscription;
  isRunning = false;
   private destroyRef = inject(DestroyRef);

  constructor() {}

  onClick() {
    this.isRunning = true;

    const map = this.nolmDrawPoint.map;
    const msg =
      this.nolmDrawPoint.msg || 'Select point (&lt;esc&gt; to cancel)';
    const drawOptions = this.nolmDrawPoint.drawOptions;
    const snapOptions = this.nolmDrawPoint.snapOptions;

    this.subscription = this.pointInteractionService
      .draw(map, msg, drawOptions, snapOptions)
      .subscribe({
        next: (event) => {
          if(event.type === 'drawstart') {
            this.onStart.emit();
          } 
          else if (event.type === 'drawend') {
            const feature = event.feature as Feature<Point>;
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
