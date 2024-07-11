import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MapService } from './map.service';
import Map from 'ol/Map';
import { NolmMapModule } from '../../../mapuiexts/ng-ol-material/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule, NolmMapModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  map: Map;

  constructor(private mapService: MapService) {
    this.map = mapService.map;
  }
}
