import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';
import { Control } from 'ol/control';
import { Map, MapEvent } from 'ol';

export interface NolmMapControlOptions {
  style?: string;
  class?: string;
  render?: ((arg0: MapEvent) => void) | undefined;
  target?: string | HTMLElement | undefined;
}

@Directive({
  selector: '[nolmMapControl]',
  standalone: true,
})
export class NolmMapControlDirective {
  @Input({ required: true }) nolmMapControl!: NolmMapControlOptions;
  @Input({ required: true }) map!: Map;
  control?: Control;

  constructor(private el: ElementRef, renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.nolmMapControl.style &&
      (this.el.nativeElement.style = this.nolmMapControl.style);
    this.nolmMapControl.class &&
      this.el.nativeElement.classList.add(this.nolmMapControl.class);
    this.el.nativeElement.style.position = 'absolute';

    this.control = new Control({
      element: this.el.nativeElement,
      render: this.nolmMapControl.render,
      target: this.nolmMapControl.target,
    });

    this.map.addControl(this.control);
  }

  ngOnDestroy(): void {
    if (this.control) this.map.removeControl(this.control);
  }
}
