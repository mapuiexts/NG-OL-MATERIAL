import { DestroyRef, Directive, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { Feature, Map } from 'ol';
import VectorSource from 'ol/source/Vector';
import { Options as DrawOptions } from 'ol/interaction/Draw';
import { Options as SnapOptions } from 'ol/interaction/Snap';
import { WriteGetFeatureOptions } from 'ol/format/WFS';
import { intersects } from 'ol/format/filter';
import { NolmGetPolygonInteractionService } from '../../../services/interaction/geometry/get-polygon-interaction.service'
import { type NolmGeomInteractionOptions } from '../../../services/interaction/geometry/interaction-geometry-options.model';
import { Polygon } from 'ol/geom';
import { NolmWfsGetFeatureService } from '../../../services/wfs/wfs-get-feature.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface NolmWfsGetFeatureByPolygonOptions {
  map: Map;
  url: string;
  wfsOptions: WriteGetFeatureOptions;
  source?: VectorSource;
  wfsFetchOptions?: any;
  startMsg?: string;
  continueMsg?: string;
  drawOptions?: DrawOptions;
  snapOptions?: SnapOptions;
}

@Directive({
  selector: '[nolmWfsGetFeatureByPolygon]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
    '[disabled]': 'isRunning()',
  },
})
export class NolmWfsGetFeatureByPolygonDirective {
  @Input({ required: true }) nolmWfsGetFeatureByPolygon!: NolmWfsGetFeatureByPolygonOptions;
  @Output() onSearch: EventEmitter<Feature[]> = new EventEmitter<Feature[]>();
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() onError: EventEmitter<Error> = new EventEmitter<Error>();
  

  public isRunning = signal(false);
  private getPolygonInteraction = inject(NolmGetPolygonInteractionService);
  private wfsGetFeatureService = inject(NolmWfsGetFeatureService);
  private destroyRef = inject(DestroyRef);
  private infoSnackBar = inject(MatSnackBar);

  constructor() {}

  onClick(): void {
    const map = this.nolmWfsGetFeatureByPolygon.map;
    const startMsg = this.nolmWfsGetFeatureByPolygon.startMsg;
    const continueMsg = this.nolmWfsGetFeatureByPolygon.continueMsg;
    const drawOptions = this.nolmWfsGetFeatureByPolygon.drawOptions;
    const snapOptions = this.nolmWfsGetFeatureByPolygon.snapOptions;
    this.isRunning.set(true);
    const subscription = this.getPolygonInteraction
      .draw(
        map,
        startMsg,
        continueMsg,
        drawOptions,
        snapOptions
      )
      .subscribe(this.SubscribeBBoxInteraction());
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private SubscribeBBoxInteraction() {
    const map = this.nolmWfsGetFeatureByPolygon.map;
    const url = this.nolmWfsGetFeatureByPolygon.url;
    const wfsOptions = this.nolmWfsGetFeatureByPolygon.wfsOptions;
    const source = this.nolmWfsGetFeatureByPolygon.source;
    const wfsFetchOptions = this.nolmWfsGetFeatureByPolygon.wfsFetchOptions;
    return {
      next: (event: NolmGeomInteractionOptions) => {
        if (event.type === 'drawstart') {
          this.onStart.emit();
        } else if (event.type === 'drawinprogress') {
          
        } else if (event.type === 'drawend') {
          const feature = event.feature as Feature<Polygon>;
          const geometry = feature.getGeometry();
          const _wfsOptions = this.addWfsFilter(
            this.nolmWfsGetFeatureByPolygon.map,
            wfsOptions,
            geometry as Polygon
          );
          this.infoSnackBar.open('fetching feature...', undefined, {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          const subscription = this.wfsGetFeatureService
            .fetch(map, url, _wfsOptions, source, wfsFetchOptions)
            .subscribe(this.subscribeWfsGetFeature());
          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        } else if (event.type === 'drawabort') {
          this.isRunning.set(false);
          this.onCancel.emit();
        }
      },
      complete: () => {
        this.isRunning.set(false);
      },
      error: (error: Error) => {
        console.error('Error: ', error);
        this.isRunning.set(false);
        this.onError.emit(error);
      },
    };
  }

  private subscribeWfsGetFeature() {
    return {
      next: (features: Feature[]) => {
        this.onSearch.emit(features);
      },
      complete: () => {
        this.isRunning.set(false);
        this.infoSnackBar.dismiss();
      },
      error: (error: Error) => {
        console.error('WFS GetFeature Error:', error);
        this.isRunning.set(false);
        this.onError.emit(error);
        this.infoSnackBar.dismiss();
      },
    };
  }

  private addWfsFilter(
    map: Map,
    wfsOptions: WriteGetFeatureOptions,
    geometry: Polygon
  ) {
    const _wfsOptions = { ...wfsOptions };
    const proj = map.getView().getProjection();
    let srsName = proj.getCode();
    const axisOrientation = proj.getAxisOrientation();
    if (axisOrientation === 'neu')
      //_wfsOptions.srsName = 'urn:x-ogc:def:crs:' + srsName;
      srsName = 'urn:x-ogc:def:crs:' + srsName;
    if (geometry) {
      const filter = intersects(
        _wfsOptions.geometryName ? _wfsOptions.geometryName : 'geometry',
        geometry,
        srsName//srsName
      );
      _wfsOptions.filter = filter;
    }
    return _wfsOptions;
  }
}