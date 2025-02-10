import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NolmLayerTreeButtonComponent } from './layer/layer-tree-button/layer-tree-button.component';
import { NolmAddCoordinateDirective } from '../../directives/button/coordinate/add-coordinate.directive';
import { NolmGetDistanceDirective } from '../../directives/button/measure/get-distance.directive';
import { NolmGetAreaDirective } from '../../directives/button/measure/get-area.directive';
import { NolmClearMeasureDirective } from '../../directives/button/measure/clear-measure.directive';
import { NolmGoToCoordinateDirective } from '../../directives/button/coordinate/go-to-coordinate.directive';
import { NolmDrawLineStringDirective } from '../../directives/button/draw/draw-linestring.directive';
import { NolmDrawPointDirective } from '../../directives/button/draw/draw-point.directive';
import { NolmDrawPolygonDirective } from '../../directives/button/draw/draw-polygon.directive';
import { NolmDrawBBoxDirective } from '../../directives/button/draw/draw-bbox.directive';
import { NolmWmsGetFeatureInfoDirective } from '../../directives/button/wms/wms-get-feature-info.directive';
import { NolmWfsGetFeatureDirective } from '../../directives/button/wfs/wfs-get-feature.directive';
import { NolmWfsGetFeatureByBBoxDirective } from '../../directives/button/wfs/wfs-get-feature-by-bbox.directive';
import { NolmWfsGetFeatureByPolygonDirective } from '../../directives/button/wfs/wfs-get-feature-by-polygon.directive';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NolmLayerTreeButtonComponent,
    NolmAddCoordinateDirective,
    NolmGetDistanceDirective,
    NolmGetAreaDirective,
    NolmClearMeasureDirective,
    NolmGoToCoordinateDirective,
    NolmDrawLineStringDirective,
    NolmDrawPointDirective,
    NolmDrawPolygonDirective,
    NolmDrawBBoxDirective,
    NolmWmsGetFeatureInfoDirective,
    NolmWfsGetFeatureDirective,
    NolmWfsGetFeatureByBBoxDirective,
    NolmWfsGetFeatureByPolygonDirective,
  ],
  exports: [
    NolmLayerTreeButtonComponent,
    NolmAddCoordinateDirective,
    NolmGetDistanceDirective,
    NolmGetAreaDirective,
    NolmClearMeasureDirective,
    NolmGoToCoordinateDirective,
    NolmDrawLineStringDirective,
    NolmDrawPointDirective,
    NolmDrawPolygonDirective,
    NolmDrawBBoxDirective,
    NolmWmsGetFeatureInfoDirective,
    NolmWfsGetFeatureDirective,
    NolmWfsGetFeatureByBBoxDirective,
    NolmWfsGetFeatureByPolygonDirective
  ]
})
export class NolmButtonModule { }
