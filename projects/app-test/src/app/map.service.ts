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
import { type FeaturePropertyDefinition } from '@mapuiexts/ng-ol-material';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  
  wfsGrbFeatureProperties: FeaturePropertyDefinition[] = [
    {
      name: 'ID',
      label: 'Id',
      value: {
        url: (feature: Feature) => feature.get('ID'),
        text: (feature: Feature) => feature.get('ID')
      }
    },
    {
      name: 'HUISNR',
      label: 'House Number',
    },
    {
      name: 'STRAATNM',
      label: 'Street Name',
    },
    {
      name: 'POSTCODE',
      label: 'Postal Code',
    },
    {
      name: 'GEMEENTE',
      label: 'Municipality',
    }
  
  ];
  private olMap?: Map;
  vectorLayer: VectorLayer<Feature<Geometry>> = this.createVectorLayer();
  constructor() { }
  
  private createExampleMap() {
    const layerGroup = new LayerGroup({
      properties: {
        name: 'Layer Group',
      },
      layers: [
        this.createGrbLayer(),
        this.createBestAddressLayer(),
        
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
        //propertiesDefinition: this.wfsGrbFeatureDescription,
      },
      visible: false,
      source: new TileWMS({
        url: 'https://geo.api.vlaanderen.be/GRB-basiskaart/wms',
        params: {
          //SERVICE: 'WMS',
          LAYERS: 'GRB_BSK',
          FORMAT: 'image/png',
          TRANSPARENT: true,
          //VERSION: '1.3.0',
          STYLES: '',
          FEATURE_COUNT: 50,
        },
      })
    });

    return layer;
  }

 

  private bestFeatureDescription = (feature: Feature) => {
    let desc = `hnr ${feature.get('housenumber')}`;
    const box = feature.get('boxnumber');
    if (box) {
      desc = `${desc}/${box} (${feature.get('status')})`;
    }
    else {
      desc = `${desc} [${feature.get('status')}]`;
    }
    return desc;
  }

  private bestFeatureProperties: FeaturePropertyDefinition[] = [
    {
      name: 'best_id',
      label: 'Best Id',
      value: {
        url: (feature: Feature) => feature.get('best_id'),
        text: (feature: Feature) => feature.get('best_id')
      }
    },
    {
      name: 'best_versionid',
      label: 'Version Id',
    },
    {
      name: 'housenumber',
      label: 'House Number',
    },
    {
      name: 'boxnumber',
      label: 'Box Number',
    },
    {
      name: 'status',
      label: 'Status',
    },
    {
      name: 'status_valid_from',
      label: 'Valid From',
    },
    {
      name: 'begin_life_span_version',
      label: 'Begin Life Span',
    },
    {
      name: 'postal_info_objectid',
      label: 'Postal Code'
    },
    {
      name: 'streetname_objectid',
      label: 'Street Name Id',
      value: {
        url: (feature: Feature) => feature.get('streetname_namespace') + feature.get('streetname_objectid'),
        text: (feature: Feature) => feature.get('streetname_namespace') + feature.get('streetname_objectid')
      }
    },
    {
      name: 'streetname_fr',
      label: 'Street Name (FR)',
    },
    {
      name: 'streetname_nl',
      label: 'Street Name (NL)',
    },
    {
      name: 'streetname_de',
      label: 'Street Name (DE)',
    },
    {
      name: 'municipality_fr',
      label: 'Municipality (FR)',
    },
    {
      name: 'municipality_nl',
      label: 'Municipality (NL)',
    },
    {
      name: 'municipality_de',
      label: 'Municipality (DE)',
    }
  ];

  createBestAddressLayer() {
    const layer = new TileLayer({
      properties: {
        name: 'Best Address',
        featureDescription: this.bestFeatureDescription,
        featureProperties: this.bestFeatureProperties
      },
      visible: true,
      source: new TileWMS({
        url: 'https://data.geo.be/ws/best/wms',
        params: {
          STYLES: '',
          LAYERS: 'bestaddress',
          FORMAT: 'image/png',
          TRANSPARENT: true,
          CRS: 'EPSG:4326',
          FEATURE_COUNT: 50
        },
        projection: 'EPSG:4326'
      })
    });

    return layer;
  }

  

  private createVectorLayer() {
    console.log('Creating vector layer with propertiesDefinition:', this.wfsGrbFeatureProperties);
    const source = new VectorSource();
    const vectorLayer = new VectorLayer({
      properties: {
        name: 'Vector Layer',
        label: 'Vector Layer',
        featureProperties: this.wfsGrbFeatureProperties
      },
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
    });
    console.log('vector layer propertiesDefinition:', vectorLayer.get('propertiesDefinition'));
    console.log('vector layer properties:', vectorLayer.getProperties());
    console.log('vector layer name:', vectorLayer.get('name'));
    console.log('vector layer label:', vectorLayer.get('label'));
    return vectorLayer;
  }
}
