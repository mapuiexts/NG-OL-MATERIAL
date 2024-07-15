import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MapService } from './map.service';
import Map from 'ol/Map';
import { NolmMapModule } from '@mapuiexts/ng-ol-material';
import { NolmTreeModule } from '@mapuiexts/ng-ol-material';
import { NolmButtonModule } from '@mapuiexts/ng-ol-material';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule, MatSidenavModule, NolmMapModule, NolmTreeModule, NolmButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  map: Map;

  constructor(private mapService: MapService) {
    this.map = mapService.map;
  }
}
