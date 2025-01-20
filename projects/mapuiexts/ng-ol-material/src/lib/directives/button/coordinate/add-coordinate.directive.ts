import { Directive, inject, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Map } from 'ol';
import { NolmGetPointInteractionService } from '../../../services/interaction/geometry/get-point-interaction.service';
import { NolmCoordinateService } from '../../../services/coordinate/coordinate.service';
import { Circle, Fill, Style } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';

export interface NolmAddCoordinateOptions {
  map: Map;
}

@Directive({
  selector: '[nolmAddCoordinate]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
  },
})
export class NolmAddCoordinateDirective implements OnDestroy {
  @Input({ required: true }) nolmAddCoordinate!: NolmAddCoordinateOptions;

  getPointInteraction = inject(NolmGetPointInteractionService);
  coordinateService = inject(NolmCoordinateService);
  subscription?: Subscription;
  isRunning = false;
  label? = '';

  constructor() {}

  onClick() {
    if (this.isRunning) {
      console.log('isRunning');
      return;
    }

    const msg = 'Pick point to add coordinate or &lt;esc&gt; to Cancel';
    const style = new Style({
      image: new Circle({
        radius: 0,
        fill: new Fill({
          color: '#ffcc33',
        }),
      }),
    });

    this.subscription = this.getPointInteraction
      .getSubscription(this.nolmAddCoordinate.map, msg, {
        source: new VectorSource(),
        type: 'Point',
        style: style,
      })
      .subscribe({
        next: (event) => {
          console.log('event', event);
          if (event.type === 'drawend') {
            const coordinate = event.geometry?.getCoordinates();
            if (coordinate) {
              this.coordinateService.addCoordinatePopup(
                this.nolmAddCoordinate.map,
                coordinate
              );
            }
          }
        },

        complete: () => {
          console.log('complete');
          this.isRunning = false;
        },
      });
    this.isRunning = true;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
