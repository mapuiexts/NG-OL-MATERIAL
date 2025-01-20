import { Directive, Input, inject } from '@angular/core';
import { Map } from 'ol';
import { NolmMeasureService } from '../../../services/measure/measure.service';

export interface NolmClearMeasureOptions {
  map: Map;
}

@Directive({
  selector: '[nolmClearMeasure]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
  },
})
export class NolmClearMeasureDirective {
  @Input({ required: true }) nolmClearMeasure!: NolmClearMeasureOptions;
  measureService = inject(NolmMeasureService);

  constructor() {}

  onClick() {
    this.measureService.clearMeasure(this.nolmClearMeasure.map);
  }
}