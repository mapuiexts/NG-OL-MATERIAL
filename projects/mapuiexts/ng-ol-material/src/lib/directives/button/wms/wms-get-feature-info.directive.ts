import {
  Directive,
  Input,
  inject,
  DestroyRef,
  signal,
  effect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { NolmGetPointInteractionService } from '../../../services/interaction/geometry/get-point-interaction.service';
import { NolmGeomInteractionOptions } from '../../../services/interaction/geometry/interaction-geometry-options.model';
import { Map } from 'ol';
import { Circle, Style } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Source } from 'ol/source';
import { Feature } from 'ol';
import { Layer } from 'ol/layer';
import LayerRenderer from 'ol/renderer/Layer';
import BaseLayer from 'ol/layer/Base';
import { Group as GroupLayer } from 'ol/layer';
import { Observer, Subscription } from 'rxjs';
import { Point } from 'ol/geom';
import { NolmWmsGetFeatureInfoResult, NolmWmsGetFeatureInfoService } from '../../../services/wms/wms-get-feature-info.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { NolmFeatureInfoDialogComponent } from '../../../components/dialog/feature/feature-info-dialog/feature-info-dialog.component';
import { NolmFeatureInfoBottomSheetComponent } from '../../../components/bottom-sheet/feature/feature-info-bottom-sheet/feature-info-bottom-sheet.component';

const style = new Style({
  image: new Circle({
    radius: 0,
  }),
});

function getLeafVisibleLayers(lyrs: BaseLayer[]): BaseLayer[] {
  let leafLyrs: BaseLayer[] = [];
  lyrs.forEach(function (lyr) {
    if (lyr instanceof GroupLayer) {
      const groupLyr = lyr as GroupLayer;
      leafLyrs = leafLyrs.concat(
        getLeafVisibleLayers(groupLyr.getLayers().getArray())
      );
    } else {
      if (lyr.get('visible')) {
        leafLyrs.push(lyr);
      }
    }
  });
  return leafLyrs;
}

export interface NolmWmsGetFeatureInfoOptions {
  map: Map;
}

@Directive({
  selector: '[nolmWmsGetFeatureInfo]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
    '[disabled]': 'isRunning()',
  },
})
export class NolmWmsGetFeatureInfoDirective implements OnInit, OnDestroy {
  @Input({ required: true })
  nolmWmsGetFeatureInfo!: NolmWmsGetFeatureInfoOptions;

  private getPointInteraction = inject(NolmGetPointInteractionService);
  private getPointSubscription?: Subscription;
  private wmsGetFeatureInfoService = inject(NolmWmsGetFeatureInfoService);
  private wmsGetFeatureInfoSubscription?: Subscription;
  private destroyRef = inject(DestroyRef);
  featuresInfo = signal<NolmWmsGetFeatureInfoResult[]>([]);
  isRunning = signal(false);
  private infoSnackBar = inject(MatSnackBar);
  private errorSnackBar = inject(MatSnackBar);
  private uiRef: any;
  openUI: () => void = () => {};

  constructor(
    private bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private responsive: BreakpointObserver
  ) {
    effect(() => {
      //to update dialog/bottom sheet if data
      //is updated after opening the dialog/bottom sheet
      if (this.uiRef instanceof MatDialogRef) {
        this.uiRef.componentInstance.data = {
          featuresInfo: this.featuresInfo(),
        };
      } else if (this.uiRef instanceof MatBottomSheetRef) {
        console.log('adding data to bottom sheet');
        this.uiRef.instance.data = {
          featuresInfo: this.featuresInfo(),
        };
      }
    });
  }

  ngOnInit(): void {
    this.openUI = this.openDialog;
    this.responsive.observe('(max-width: 600px)').subscribe((result) => {
      if (result.matches) {
        this.openUI = this.openBottomSheet;
      } else {
        this.openUI = this.openDialog;
      }
    });
  }

  ngOnDestroy(): void {
    this.responsive.ngOnDestroy();
  }

  private openDialog(): void {
    this.uiRef = this.dialog.open(NolmFeatureInfoDialogComponent, {
      //data: this.data,
      data: {
        featuresInfo: this.featuresInfo(),
      },
      hasBackdrop: true,
    });
  }

  openBottomSheet(): void {
    this.uiRef = this.bottomSheet.open(NolmFeatureInfoBottomSheetComponent, {
      //data: this.data(),
      data: {
        featuresInfo: this.featuresInfo(),
      },
      hasBackdrop: true,
    });
  }

  onClick(): void {
    if (this.isRunning()) {
      return;
    }
    this.isRunning.set(true);
    this.featuresInfo.set([]);
    const msg = 'Select feature in the map or &lt;esc&gt; to Cancel';

    this.getPointSubscription = this.getPointInteraction
      .draw(this.nolmWmsGetFeatureInfo.map, msg, {
        source: new VectorSource(),
        type: 'Point',
        style: style,
      })
      .subscribe(this.getPointInteractionObserver());
    this.destroyRef.onDestroy(() => {
      this.getPointSubscription?.unsubscribe();
    });
  }

  private showErrorSnackBar(): void {
    const msg = 'Error during fetching. Check log in the console...';
    this.errorSnackBar.open(msg, undefined, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 2000,
    });
  }

  private showNoFeatureFoundSnackBar(): void {
    const msg = 'No feature found...';
    this.errorSnackBar.open(msg, undefined, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 2000,
    });
  }

  private getPointInteractionObserver(): Observer<NolmGeomInteractionOptions> {
    const map = this.nolmWmsGetFeatureInfo.map;
    return {
      next: (event) => {
        if (event.type === 'drawstart') {
          //this.isRunning = true;
        } else if (event.type === 'drawabort') {
          this.isRunning.set(false);
        } else if (event.type === 'drawend') {
          const feature: Feature<Point> = event.feature as Feature<Point>;
          const coordinate = feature.getGeometry()?.getCoordinates();
          const layers = getLeafVisibleLayers(
            this.nolmWmsGetFeatureInfo.map.getLayers().getArray()
          ).filter((layer): layer is Layer<Source, LayerRenderer<any>> => {
            if (layer instanceof Layer) {
              const source = layer.getSource();
              if ((source as any).getFeatureInfoUrl) return true;
              else return false;
            } else {
              return false;
            }
          });
          if (coordinate && layers.length > 0) {
            this.infoSnackBar.open('Fetching feature info...', undefined, {
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            this.wmsGetFeatureInfoSubscription = this.wmsGetFeatureInfoService
              .fetch(map, layers, coordinate)
              .subscribe({
                //next: (features: Feature[]) => {
                next: (featureInfoResult: NolmWmsGetFeatureInfoResult) => {
                  this.featuresInfo.update((prevFeaturesInfo) => {
                    return [...prevFeaturesInfo, featureInfoResult];
                  });
                },
                error: (error) => {
                  this.isRunning.set(false);
                  this.infoSnackBar.dismiss();
                  //this.showErrorSnackBar();
                  if (this.featuresInfo().length > 0) {
                    this.openUI();
                  } else {
                    this.showNoFeatureFoundSnackBar();
                  }
                },
                complete: () => {
                  this.isRunning.set(false);
                  this.infoSnackBar.dismiss();
                  if (this.featuresInfo().length > 0) {
                    this.openUI();
                  } else {
                    this.showNoFeatureFoundSnackBar();
                  }
                },
              });
            this.destroyRef.onDestroy(() => {
              this.wmsGetFeatureInfoSubscription?.unsubscribe();
            });
          } else {
            this.isRunning.set(false);
            this.showNoFeatureFoundSnackBar();
          }
        }
      },
      error: (err) => {
        this.isRunning.set(false);
        console.error(err);
      },
      complete: () => {
        //this.isRunning = false;
      },
    };
  }
}
