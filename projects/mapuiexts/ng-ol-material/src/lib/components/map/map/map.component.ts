import {
  Component,
  ViewChild,
  Input,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import Map from 'ol/Map';

@Component({
  selector: 'nolm-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class NolmMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer?: ElementRef;
  @Input({ required: true }) map!: Map;
  @Input() style: string = 'width: 100%; height: 100%;';

  constructor() {}

  ngAfterViewInit(): void {
    if (this.mapContainer) {
      this.map.setTarget(this.mapContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.map.setTarget(undefined);
  }
}
