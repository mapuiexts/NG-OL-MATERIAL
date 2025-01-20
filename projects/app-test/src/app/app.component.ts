import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MapService } from './map.service';
import Map from 'ol/Map';
import { NolmMapModule } from '@mapuiexts/ng-ol-material';
import { NolmTreeModule } from '@mapuiexts/ng-ol-material';
import { NolmButtonModule } from '@mapuiexts/ng-ol-material';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatSlideToggleModule, MatSidenavModule, MatMenuModule, MatTooltipModule, MatIconModule, NolmMapModule, NolmTreeModule, NolmButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  map: Map;

  constructor(private mapService: MapService) {
    this.map = mapService.map;
  }
}
