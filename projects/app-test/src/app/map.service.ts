import { Injectable } from '@angular/core';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import LayerGroup from 'ol/layer/Group';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Feature, Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, FullScreen } from 'ol/control';
import { Geometry } from 'ol/geom';
import { Style, Fill, Circle, Stroke } from 'ol/style';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }
  private olMap?: Map;
  vectorLayer: VectorLayer<Feature<Geometry>> = this.createVectorLayer();

  private createExampleMap() {
    const layerGroup = new LayerGroup({
      properties: {
        name: 'Layer Group',
      },
      layers: [
        this.createGrbLayer(),
        // new TileLayer({
        //   minResolution: 0,
        //   maxResolution: 200,
        //   properties: {
        //     name: 'OSM-Overlay-WMS',
        //   },
        //   source: new TileWMS({
        //     url: 'https://ows.terrestris.de/osm/service',
        //     params: {
        //       LAYERS: 'OSM-Overlay-WMS',
        //     },
        //   }),
        // }),
        // new TileLayer({
        //   minResolution: 0,
        //   maxResolution: 10,
        //   properties: {
        //     name: 'SRTM30-Contour',
        //   },
        //   source: new TileWMS({
        //     url: 'https://ows.terrestris.de/osm/service',
        //     params: {
        //       LAYERS: 'SRTM30-Contour',
        //     },
        //   }),
        // }),
      ],
    });


    const map = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      layers: [
        new TileLayer({
          properties: {
            name: 'OSM',
          },
          source: new OSM(),
        }),
        //this.createGrbLayer(),
        layerGroup,
        this.vectorLayer

      ],
      view: new View({
        //center: fromLonLat([12.924, 47.551]),
        center: fromLonLat([4.472, 50.858]),
        zoom: 18,
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

  private createGrbLayer() {
    const layer = new TileLayer({
      properties: {
        name: 'GRB',
      },
      visible: false,
      source: new TileWMS({
        url: 'https://geo.api.vlaanderen.be/GRB-basiskaart/wms',
        params: {
          SERVICE: 'WMS',
          LAYERS: 'GRB_BSK',
          FORMAT: 'image/png',
          TRANSPARENT: true,
          //VERSION: '1.3.0',
          STYLES: '',
        },
      })
    });

    return layer;
  }


  private createVectorLayer() {
    const source = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.5)',
        }),
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, 0.5)',
          //lineDash: [10, 10],
          width: 3,
        }),
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: '#ff0000',
          }),
        }),
      }),

      properties: {
        name: 'Vector Layer',
      },
    });
    return vectorLayer;
  }
}
