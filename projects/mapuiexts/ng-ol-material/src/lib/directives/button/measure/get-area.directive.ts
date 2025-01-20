import { Directive, Input, inject } from '@angular/core';
import { Map } from 'ol';
import { NolmMeasureService } from '../../../services/measure/measure.service';

export interface NolmGetAreaOptions {
  map: Map;
}

@Directive({
  selector: '[nolmGetArea]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
  },
})
export class NolmGetAreaDirective {
  @Input({ required: true }) nolmGetArea!: NolmGetAreaOptions;

  measureService = inject(NolmMeasureService);
  constructor() {}

  onClick() {
    this.measureService.getArea(this.nolmGetArea.map);
  }
}