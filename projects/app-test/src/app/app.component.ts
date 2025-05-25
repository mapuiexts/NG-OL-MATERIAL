import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MapService } from './map.service';
import Map from 'ol/Map';
import { Vector as VectorSource } from 'ol/source';
import { NolmMapModule } from '@mapuiexts/ng-ol-material';
import { NolmTreeModule } from '@mapuiexts/ng-ol-material';
import { NolmButtonModule } from '@mapuiexts/ng-ol-material';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NolmCoordinateButton } from '@mapuiexts/ng-ol-material';
import { NolmDrawLineStringDirective } from '@mapuiexts/ng-ol-material';
import { NolmDrawPointDirective } from '@mapuiexts/ng-ol-material';
import { NolmDrawPolygonDirective } from '@mapuiexts/ng-ol-material';
import { NolmDrawBBoxDirective } from '@mapuiexts/ng-ol-material';
import { NolmWmsGetFeatureInfoDirective } from '@mapuiexts/ng-ol-material';
import { NolmWfsGetFeatureDirective } from '@mapuiexts/ng-ol-material';
import { NolmWfsGetFeatureByBBoxDirective } from '@mapuiexts/ng-ol-material';
import { NolmWfsGetFeatureByPolygonDirective } from '@mapuiexts/ng-ol-material';
import { NolmWfsDescribeFeatureTypeDirective } from '@mapuiexts/ng-ol-material';
import { NolmWfsFeatureTableComponent } from '@mapuiexts/ng-ol-material';
import { Feature } from 'ol';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';
import WKT from 'ol/format/WKT';
import { WriteGetFeatureOptions } from 'ol/format/WFS';
import GeoJSON from 'ol/format/GeoJSON';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatSlideToggleModule, 
    MatSidenavModule, MatMenuModule, MatTooltipModule, 
    MatIconModule, MatCheckboxModule, FormsModule, MatFormFieldModule,
    NolmButtonModule,
    NolmMapModule, NolmTreeModule, 
    NolmDrawPolygonDirective, NolmDrawLineStringDirective, NolmDrawPointDirective, NolmDrawBBoxDirective,
    NolmWmsGetFeatureInfoDirective,
    NolmWfsGetFeatureDirective, NolmWfsGetFeatureByBBoxDirective, NolmWfsGetFeatureByPolygonDirective,
    NolmWfsDescribeFeatureTypeDirective, NolmWfsFeatureTableComponent
    
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  {
  mapService = inject(MapService);
  map: Map = this.mapService.map;
  layer = this.mapService.vectorLayer;
  source = this.mapService.vectorLayer.getSource() as VectorSource<Feature<Geometry>>;
  isVisibile = true;
  wkt = '';
  url = 'https://geo.api.vlaanderen.be/GRB/wfs';
  wfsOptions: WriteGetFeatureOptions = {
    //srsName: 'EPSG:31370',
    //srsName: 'EPSG:4326',
    featureNS: 'https://geo.api.vlaanderen.be/GRB',
    featurePrefix: 'GRB',
    featureTypes: ['Adres'],
    geometryName: 'SHAPE',
    //outputFormat: 'application/json',
    maxFeatures: 200,
  };

  

  constructor() {
  }


  handleClickBinded = this.handleClick.bind(this);

  private handleClick(event: Event): void {
    const target = event.target as NolmCoordinateButton;
    if(target.nolmCoordinate) {
      let coordinate = target.nolmCoordinate.split(',').map(n => parseFloat(n)) as Coordinate;
      console.log('coordinate:', coordinate);
      const geom = new Point(coordinate);
      const wktFormat = new WKT();
      this.wkt = geom && wktFormat.writeGeometry(geom);
    }
  }

  onDrawPolygon(feature: Feature<Geometry>): void {
    const geom = feature.getGeometry() as Polygon;
    const coordinates = geom?.getCoordinates();
    console.log('Polygon coordinates:', coordinates);
    const wktFormat = new WKT();
    this.wkt = geom && wktFormat.writeGeometry(geom);
  }

  onDrawLine(feature: Feature<Geometry>): void {
    const geom = feature.getGeometry() as LineString;
    const coordinates = geom?.getCoordinates();
    console.log('Line coordinates:', coordinates);
    const wktFormat = new WKT();
    this.wkt = geom && wktFormat.writeGeometry(geom);
  }

  onDrawPoint(feature: Feature<Geometry>): void {
    const geom = feature.getGeometry() as Point;
    const coordinates = geom?.getCoordinates();
    console.log('Point coordinates:', coordinates);
    const wktFormat = new WKT();
    this.wkt = geom && wktFormat.writeGeometry(geom);
  }

  onSearch(features: Feature[]): void {
    console.log('Features:', features);
    const geoJsonFormat = new GeoJSON();
    this.wkt = features.map(f => {
      const geoJson = geoJsonFormat.writeFeatureObject(f);
      return JSON.stringify(geoJson.properties, null, 4);
      // const geom = f.getGeometry() as Point;
      // const coordinates = geom?.getCoordinates();
      // return coordinates.toString();
    }).join('\n');
    
  }

  onFetchFeatureType(response: any): void {
    console.log('WFS Describe Feature Type Response:', response);
    this.wkt = JSON.stringify(response, null, 4);
  }
}
