import { Injectable } from '@angular/core';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import LayerGroup from 'ol/layer/Group';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }
  private olMap?: Map;

  private createExampleMap() {
    const layerGroup = new LayerGroup({
      properties: {
        name: 'Layer Group',
      },
      layers: [
        new TileLayer({
          minResolution: 0,
          maxResolution: 200,
          properties: {
            name: 'OSM-Overlay-WMS',
          },
          source: new TileWMS({
            url: 'https://ows.terrestris.de/osm/service',
            params: {
              LAYERS: 'OSM-Overlay-WMS',
            },
          }),
        }),
        new TileLayer({
          minResolution: 0,
          maxResolution: 10,
          properties: {
            name: 'SRTM30-Contour',
          },
          source: new TileWMS({
            url: 'https://ows.terrestris.de/osm/service',
            params: {
              LAYERS: 'SRTM30-Contour',
            },
          }),
        }),
      ],
    });

    const map = new Map({
      layers: [
        new TileLayer({
          properties: {
            name: 'OSM',
          },
          source: new OSM(),
        }),
        layerGroup,
      ],
      view: new View({
        center: fromLonLat([12.924, 47.551]),
        zoom: 13,
      }),
    });

    return map;
  }

  get map(): Map {
    if (!this.olMap) {
      this.olMap = this.createExampleMap();
    }
    return this.olMap;
  }
}
