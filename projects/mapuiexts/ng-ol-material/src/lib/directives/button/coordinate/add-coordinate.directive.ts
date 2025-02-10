import { Directive, inject, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Feature, Map } from 'ol';
import { NolmGetPointInteractionService } from '../../../services/interaction/geometry/get-point-interaction.service';
import { NolmCoordinateService } from '../../../services/coordinate/coordinate.service';
import { Circle, Fill, Style } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';

export interface NolmAddCoordinateOptions {
  map: Map;
  button?: {
    label: string;
    click: (event: Event) => void;
  }
}

@Directive({
  selector: '[nolmAddCoordinate]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
    '[disabled]': 'isRunning',
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
    this.isRunning = true;

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
      .draw(this.nolmAddCoordinate.map, msg, {
        source: new VectorSource(),
        type: 'Point',
        style: style,
      })
      .subscribe({
        next: (event) => {
          if (event.type === 'drawend') {
            const feature = event.feature as Feature<Point>;
            const coordinate = feature?.getGeometry()?.getCoordinates();
            if (coordinate) {
              this.coordinateService.addCoordinatePopup(
                this.nolmAddCoordinate.map,
                coordinate,
                this.nolmAddCoordinate.button
              );
            }
          }
        },

        complete: () => {
          this.isRunning = false;
        },
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
