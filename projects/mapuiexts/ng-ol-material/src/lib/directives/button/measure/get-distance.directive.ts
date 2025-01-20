import { Directive, Input, inject } from '@angular/core';
import { Map } from 'ol';
import { NolmMeasureService } from '../../../services/measure/measure.service';

export interface NolmGetDistanceOptions {
  map: Map;
}

@Directive({
  selector: '[nolmGetDistance]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
  },
})
export class NolmGetDistanceDirective {
  @Input({ required: true }) nolmGetDistance!: NolmGetDistanceOptions;

  measureService = inject(NolmMeasureService);

  constructor() {}

  onClick() {
    this.measureService.getDistance(this.nolmGetDistance.map);
  }
}